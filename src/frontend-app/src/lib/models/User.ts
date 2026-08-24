export interface User {
  id: bigint;
  login: string;
  email: string;
  role: string;
}

export interface UserFormData {
  id: bigint;
  login: string;
  email: string;
  senha?: string;
  role: string;
}
