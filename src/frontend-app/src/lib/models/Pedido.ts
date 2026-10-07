import type { Produto } from './Produto';
import type { Endereco } from './Endereco';

export interface Pedido {
  id: number;
  data_pedido: string;
  status: string; 
  valor: number; 
  id_usuario: bigint;
  id_endereco: bigint;

  items?: ItemPedido[];
  endereco?: Endereco;
}

export interface ItemPedido {
  id: number;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;       
  id_pedido: bigint;
  id_produto: bigint;
  
  produto?: Produto;
}

export interface PedidoFormData {
  id_endereco: number;
  items: {
    id_produto: number;
    quantidade: number;
  }[];
}
