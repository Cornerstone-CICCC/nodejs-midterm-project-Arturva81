export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}
