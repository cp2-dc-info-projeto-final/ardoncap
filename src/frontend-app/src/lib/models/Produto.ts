export interface Produto {
    id: number;
    nome: string;
    descricao: string;
    preco: number;
    id_categoria: bigint;
    id_usuario: bigint;
    categoria_nome: string; //usar um inner join
}
  
export interface ProdutoFormData {
    id?: number; 
    nome: string;
    descricao: string;
    preco: number;
    id_categoria: number;
}
