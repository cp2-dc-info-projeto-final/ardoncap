export interface Produto {
    id: bigint;
    nome: string;
    descricao: string;
    quantidade_disponivel: number;
    preco: number;
    id_categoria: number;
    id_usuario: bigint;
    categoria_nome: string;
}

export interface ProdutoFormData {
    id?: bigint;
    nome: string;
    descricao: string;
    quantidade_disponivel: number;
    preco: number;
    id_categoria: number;
}
