export interface Endereco {
  id: number;
  cep: number;
  rua: string;
  numero: number | null;
  cidade: string;
  estado: string;
  complemento: string | null;
  id_usuario: bigint;
}

export interface EnderecoFormData {
  id: number;
  cep: number;
  rua: string;
  numero: number | null;
  cidade: string;
  estado: string;
  complemento: string | null;
}