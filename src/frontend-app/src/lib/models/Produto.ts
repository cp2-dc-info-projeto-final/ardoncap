export interface Produto {
    id: number;
    nome: string;
    descricao: string;
    quantidade_disponivel: number;
    preco: number;
    id_categoria: number;
    id_usuario: number;
    categoria_nome: string;
  }
  
  export interface ProdutoFormData {
    id: number;
    nome: string;
    descricao: string;
    quantidade_disponivel: number;
    preco: number;
    id_categoria: number;
  }  
