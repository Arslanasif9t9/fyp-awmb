export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface World {
  id: string;
  name: string;
  domain: string;
  purpose: string;
  current_version: number;
  created_at: string;
}

export interface CreateWorldIn {
  name: string;
  domain: string;
  purpose: string;
}

export interface FileOut {
  id: string;
  filename: string;
  file_type: string;
  status: string;
  uploaded_at: string;
}