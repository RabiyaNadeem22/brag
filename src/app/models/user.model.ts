// src/app/models/user.model.ts
export interface User {
    id?: number;       // Optional for new users
    username: string;
    email: string;
    password: string;
    industry: string;
  }
  