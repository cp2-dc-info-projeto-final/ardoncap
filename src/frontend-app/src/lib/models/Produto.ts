export interface Produto {
    id: number;
    nome: string;
    descricao: string;
    quantidade_disponivel: number;
    preco: number;
    id_categoria: number;
    id_usuario: bigint;
    categoria_nome: string; //usar um inner join
}
  
export interface ProdutoFormData {
    id?: number;
    nome: string;
    descricao: string;
    quantidade_disponivel: number;
    preco: number;
    id_categoria: number;
}
