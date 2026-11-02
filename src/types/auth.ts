export interface User {
  id: number;
  email: string;
  role: string;
  telegramChatId?: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  role: string;
}

