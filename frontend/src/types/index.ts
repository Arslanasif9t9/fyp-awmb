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