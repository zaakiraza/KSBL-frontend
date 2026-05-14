import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Types
export interface User {
  id: string;
  username: string;
  role: 'teacher' | 'student';
}

export interface Textbook {
  id: string;
  title: string;
  subject: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface StudentAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  createdBy: string;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  remark: string;
}

export interface Quiz {
  id: string;
  title: string;
  chapter: string;
  topic: string;
  totalQuestions: number;
  duration: number;
  questions: QuizQuestion[];
  createdBy: string;
  published: boolean;
  createdAt: string;
  pdfBase64?: string;
  expiresAt?: string;
  marksType?: 'equal' | 'custom';
  equalMarksPerQuestion?: number;
  complexityLevel?: 'easy' | 'medium' | 'hard';
  maxAttempts?: number;
}

export interface StudentQuizAttempt {
  id: string;
  studentId: string;
  quizId: string;
  answers: number[];
  score: number;
  totalQuestions: number;
  attemptedAt: string;
  timeTaken: number;
}

interface AppContextType {
  currentUser: User | null;
  login: (username: string, role: 'teacher' | 'student') => void;
  logout: () => void;
  textbooks: Textbook[];
  addTextbook: (textbook: Textbook) => void;
  students: StudentAccount[];
  addStudent: (student: StudentAccount) => void;
  quizzes: Quiz[];
  addQuiz: (quiz: Quiz) => void;
  publishQuiz: (quizId: string) => void;
  getPublishedQuizzes: () => Quiz[];
  attempts: StudentQuizAttempt[];
  saveAttempt: (attempt: StudentQuizAttempt) => void;
  getAttemptsByStudent: (studentId: string) => StudentQuizAttempt[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [students, setStudents] = useState<StudentAccount[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<StudentQuizAttempt[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedTextbooks = localStorage.getItem('textbooks');
    const savedStudents = localStorage.getItem('students');
    const savedQuizzes = localStorage.getItem('quizzes');
    const savedAttempts = localStorage.getItem('attempts');

    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedTextbooks) setTextbooks(JSON.parse(savedTextbooks));
    if (savedStudents) setStudents(JSON.parse(savedStudents));
    if (savedQuizzes) setQuizzes(JSON.parse(savedQuizzes));
    if (savedAttempts) setAttempts(JSON.parse(savedAttempts));
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('textbooks', JSON.stringify(textbooks));
  }, [textbooks]);

  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem('attempts', JSON.stringify(attempts));
  }, [attempts]);

  const login = (username: string, role: 'teacher' | 'student') => {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      role,
    };
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const addTextbook = (textbook: Textbook) => {
    const updated = [...textbooks, textbook];
    setTextbooks(updated);
  };

  const addStudent = (student: StudentAccount) => {
    const updated = [...students, student];
    setStudents(updated);
  };

  const addQuiz = (quiz: Quiz) => {
    const updated = [...quizzes, quiz];
    setQuizzes(updated);
  };

  const publishQuiz = (quizId: string) => {
    const updated = quizzes.map((q) =>
      q.id === quizId ? { ...q, published: true } : q
    );
    setQuizzes(updated);
  };

  const getPublishedQuizzes = (): Quiz[] => {
    return quizzes.filter((q) => q.published);
  };

  const saveAttempt = (attempt: StudentQuizAttempt) => {
    const updated = [...attempts, attempt];
    setAttempts(updated);
  };

  const getAttemptsByStudent = (studentId: string): StudentQuizAttempt[] => {
    return attempts.filter((a) => a.studentId === studentId);
  };

  const value: AppContextType = {
    currentUser,
    login,
    logout,
    textbooks,
    addTextbook,
    students,
    addStudent,
    quizzes,
    addQuiz,
    publishQuiz,
    getPublishedQuizzes,
    attempts,
    saveAttempt,
    getAttemptsByStudent,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
