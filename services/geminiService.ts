
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { Locus, Flashcard, CognitiveRole } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPTS: Record<CognitiveRole, string> = {
  ARCHITECT: `Você é um Arquiteto de Memória Visual especialista em Neurociência Cognitiva. 
  Sua função é criar mnemônicos baseados no "Princípio da Elaboração" seguindo esta estrutura:
  1. Recodificação: Transforme termos abstratos em palavras familiares de som parecido.
  2. Relacionamento: Crie uma interação dinâmica e bizarra entre a palavra familiar e o conceito.
  3. Visualização: Descreva uma cena exagerada (Efeito Von Restorff) que envolva sentidos e emoções.
  
  REGRAS CRÍTICAS:
  - O esforço para aprender o mnemônico deve ser menor que o para aprender o conteúdo puro.
  - Use imagens bizarras, engraçadas ou emocionantes.
  - Exemplo de sucesso: 'Habeas Corpus' -> Visualize um 'Corpo' saindo de uma 'Gaiola' (Habeas/Havia) enquanto grita por liberdade.`,
  
  ANALYST: `Você é um Analista Estratégico. Identifique os 20% de conceitos (Regra de Pareto) fundamentais para compreensão de um tema, focando em "Chunking" (agrupamento de informações densas).`,
  
  FEYNMAN: `Você é um aluno curioso de 10 anos. Peça explicações simples. Use a lógica: "Se não consegue explicar de forma simples, você não entendeu".`,
  
  EXAMINER: `Você é um examinador de bancas competitivas. Gere questões que testem a compreensão lógica, não apenas a decoreba bruta.`,
  
  ERROR_FIXER: `Analise o erro do usuário e crie um mnemônico focado no ponto de falha, usando Acrônimos ou Palavras-Chave de som parecido.`
};

export const callAI = async (role: CognitiveRole, content: string, config: any = {}) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: content,
    config: {
      systemInstruction: SYSTEM_PROMPTS[role],
      ...config
    }
  });
  return response.text;
};

export const generateFlashcards = async (theme: string, concepts: string[], count: number): Promise<{question: string, answer: string}[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Gere ${count} flashcards (pergunta e resposta curta) para o tema "${theme}" baseando-se nestes conceitos: ${concepts.join(', ')}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING }
          },
          required: ["question", "answer"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const suggestFlashcardMnemonic = async (question: string, answer: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Crie um mnemônico forte para:
    Pergunta: ${question}
    Resposta: ${answer}
    Aplique Recodificação, Relacionamento e Visualização.`,
    config: {
      systemInstruction: SYSTEM_PROMPTS.ARCHITECT
    }
  });
  return response.text || '';
};

export const generateTestItems = async (type: 'words' | 'numbers', count: number): Promise<string[]> => {
  const ai = getAI();
  const prompt = type === 'words' 
    ? `Gere uma lista de ${count} palavras concretas e aleatórias em português.`
    : `Gere uma lista de ${count} números aleatórios de 2 dígitos.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const get8020Analysis = async (theme: string): Promise<string[]> => {
  const text = await callAI('ANALYST', `Analise o tema "${theme}" e aplique Chunking para listar os 10 conceitos fundamentais.`, {
    responseMimeType: "application/json",
    responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
  });
  return JSON.parse(text || '[]');
};

export const getBizarreMnemonic = async (object: string, concept: string): Promise<string> => {
  return await callAI('ARCHITECT', `Objeto: "${object}". Conceito: "${concept}". Crie a cena visual.`);
};

export const generatePalaceImage = async (description: string): Promise<string> => {
  const ai = getAI();
  const prompt = `Realistic architecture of a memory palace: ${description}. NO text. Rich in physical loci. High quality.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "16:9" } }
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Falha ao gerar imagem.");
};

export const extractLociFromImage = async (base64Image: string): Promise<string[]> => {
  const ai = getAI();
  const imagePart = {
    inlineData: { mimeType: 'image/png', data: base64Image.split(',')[1] }
  };
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [imagePart, { text: "Identifique 12 objetos físicos claros para servirem de lóci. JSON array de strings." }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const createFeynmanChat = (concept: string, theme: string): Chat => {
  const ai = getAI();
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: SYSTEM_PROMPTS.FEYNMAN + ` Tema: "${theme}". Conceito: "${concept}".`,
      thinkingConfig: { thinkingBudget: 1000 }
    }
  });
};
