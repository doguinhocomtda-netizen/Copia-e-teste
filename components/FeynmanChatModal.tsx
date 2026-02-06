
import React, { useState, useEffect, useRef } from 'react';
import { createFeynmanChat } from '../services/geminiService';
import { Locus } from '../types';
import { GenerateContentResponse } from '@google/genai';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface FeynmanChatModalProps {
  locus: Locus;
  theme: string;
  onClose: () => void;
}

export const FeynmanChatModal: React.FC<FeynmanChatModalProps> = ({ locus, theme, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = createFeynmanChat(locus.concept, theme);
    // Initial message from AI student
    setMessages([{ 
      role: 'model', 
      text: `Olá! Eu quero muito aprender sobre "${locus.concept}". Você poderia me explicar o que é isso de uma forma bem simples?` 
    }]);
  }, [locus.concept, theme]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMsg = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const result = await chatRef.current.sendMessageStream({ message: userMsg });
      let fullText = '';
      
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        // Correctly handle streaming chunks by accessing the .text property.
        const chunkText = c.text || '';
        fullText += chunkText;
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = { role: 'model', text: fullText };
          return newMsgs;
        });
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Ops, me perdi na explicação... pode repetir?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl h-[80vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-xl">🎓</div>
            <div>
              <h3 className="font-bold text-slate-100">Sala de Ensino (Protégé)</h3>
              <p className="text-xs text-slate-400">Ensinando: <span className="text-amber-400">{locus.concept}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-2xl">&times;</button>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-amber-600 text-slate-950 font-medium rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
              }`}>
                {msg.text || (isTyping && idx === messages.length - 1 ? '...' : '')}
              </div>
            </div>
          ))}
          {isTyping && messages[messages.length-1].role === 'user' && (
            <div className="flex justify-start">
              <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 animate-pulse text-slate-400 text-sm">
                O aluno está processando sua explicação...
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-slate-800 bg-slate-800/20">
          <div className="flex space-x-3">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Explique o conceito aqui..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button 
              onClick={handleSend}
              disabled={isTyping || !inputText.trim()}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all"
            >
              Enviar
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-3 text-center uppercase tracking-widest font-bold">
            💡 Dica: Se o aluno não entender, tente usar uma analogia do dia a dia.
          </p>
        </div>
      </div>
    </div>
  );
};