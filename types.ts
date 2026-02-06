
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CREATE = 'CREATE',
  STUDY = 'STUDY',
  SCIENCE = 'SCIENCE',
  FLASHCARDS = 'FLASHCARDS',
  TESTS = 'TESTS',
  PERFORMANCE = 'PERFORMANCE'
}

export type CognitiveRole = 
  | 'ARCHITECT'   // Cria imagens mentais bizarras/exageradas
  | 'ANALYST'     // Identifica o 80/20 do conteúdo
  | 'FEYNMAN'     // Aluno curioso que detecta lacunas
  | 'EXAMINER'    // Simula bancas de concurso (FGV, FCC, etc)
  | 'ERROR_FIXER' // Transforma erros em flashcards

export enum StudyStage {
  META = 'META',          // Definição do que estudar
  BREAK_8020 = '8020',    // Priorização estratégica
  ANCHORING = 'ANCHOR',   // Colocação no Palácio
  PRACTICE = 'PRACTICE',  // Exercícios e Feynman
  REVIEW = 'REVIEW'       // SRS (Flashcards)
}

export interface Locus {
  id: string;
  objectName: string;
  concept: string;
  mentalImage?: string; // Imagem mental bizarra gerada pela IA
  explanation?: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  mnemonic?: string;
  sourceError?: string; // Se este card nasceu de um erro específico
  lastReview: number;
  nextReview: number;
  interval: number;
  repetitions: number;
  easeFactor: number;
}

export interface Palace {
  id: string;
  title: string;
  theme: string;
  description: string;
  imageUrl: string;
  loci: Locus[];
  flashcards: Flashcard[];
  createdAt: number;
  nextReview: number;
  reviewLevel: number;
}

export interface TestResult {
  id: string;
  type: 'words' | 'numbers';
  itemCount: number;
  timeTaken: number;
  score: number;
  date: number;
  failedItems?: string[]; // Itens que o usuário errou para gerar flashcards
}
