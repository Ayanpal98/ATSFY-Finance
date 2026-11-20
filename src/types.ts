export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  currency: 'INR' | 'USD' | 'EUR';
  complianceConsent: boolean;
  createdAt: string;
}

export interface Income {
  id?: string;
  source: string;
  amount: number;
  frequency: 'monthly' | 'one-time' | 'yearly';
  date: string;
}

export interface Expense {
  id?: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  tags?: string[];
}

export interface Budget {
  id?: string;
  category: string;
  limit: number;
  period: 'weekly' | 'monthly' | 'yearly';
}

export interface Goal {
  id?: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  updatedAt: string;
}
