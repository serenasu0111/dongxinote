export interface User {
  _id: string;
  username: string;
  email: string;
  settings: {
    aiAnswerLength: 'normal' | 'long' | 'short';
    autoBackup: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Inventory {
  _id: string;
  userId: string;
  name: string;
  type: 'book' | 'course' | 'other';
  remark: string;
  isArchived: boolean;
  isDefault: boolean;
  noteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  userId: string;
  inventoryId: string | Inventory;
  type: 'image' | 'document' | 'text';
  originalContent: string;
  ocrContent: string;
  remark: string;
  tags: string[];
  relatedNotes: Note[] | string[];
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  _id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface TimelineItem {
  _id: string;
  count: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface SearchResult {
  notes: Note[];
  pagination: Pagination;
}

export interface AIResponse {
  answer: string;
  sourceNotes: {
    id: string;
    preview: string;
    inventoryName: string;
  }[];
}
