export interface Task {
  id: string;
  category: string;
  description: string;
  createdAt: string;
  dueDate: string | null;
  completed: boolean;
}

export const CATEGORIES = [
  'Personal', 'Work', 'Study', 'Debts', 'Health',
  'Home', 'Finance', 'Family', 'Shopping', 'Goals', 'Urgent'
] as const;

export type CategoryType = typeof CATEGORIES[number];
