import { writable } from 'svelte/store';
import type { Produto } from '$lib/models/Produto';


// Interface para o item dentro do carrinho
export interface CartItem {
    produto: Produto;
    quantidade: number;
}

const isBrowser = typeof window !== 'undefined';

// Usuário atualmente conectado
let usuarioAtual: number | string | null = null;

// Store do carrinho
const cartStore = writable<CartItem[]>([]);

// Carrega o carrinho correspondente ao usuário
function definirUsuario(idUsuario: number | string | null) {
    if (!isBrowser) return;

    // Impede que os dados de uma conta apareçam em outra
    usuarioAtual = null;
    cartStore.set([]);

    if (idUsuario === null) return;

    usuarioAtual = idUsuario;

    const chave = `addoncap_cart_${idUsuario}`;

    try {
        const dados = localStorage.getItem(chave);
        const itens: CartItem[] = dados ? JSON.parse(dados) : [];

        cartStore.set(Array.isArray(itens) ? itens : []);
    } catch {
        cartStore.set([]);
    }
}

// Salva automaticamente as alterações no carrinho do usuário atual
if (isBrowser) {
    cartStore.subscribe((value) => {
        if (usuarioAtual !== null) {
            const chave = `addoncap_cart_${usuarioAtual}`;

            localStorage.setItem(chave, JSON.stringify(value));
        }
    });
}

// Funções utilitárias do carrinho
export const cart = {
    subscribe: cartStore.subscribe,

    definirUsuario,

    // Adiciona um produto ou aumenta sua quantidade
    adicionar(produto: Produto, quantidade = 1): boolean {
        let adicionado = false;
    
        cartStore.update((itens) => {
            if (produto.quantidade_disponivel <= 0) {
                return itens;
            }
    
            const index = itens.findIndex(
                (item) => item.produto.id === produto.id
            );
    
            const quantidadeAtual = index !== -1
                ? itens[index].quantidade
                : 0;
    
            const disponivel = produto.quantidade_disponivel - quantidadeAtual;
    
            if (disponivel <= 0) {
                return itens;
            }
    
            const quantidadeAdicionar = Math.min(quantidade, disponivel);
    
            if (index !== -1) {
                itens[index].quantidade += quantidadeAdicionar;
            } else {
                itens.push({
                    produto,
                    quantidade: quantidadeAdicionar
                });
            }
    
            adicionado = true;
            return [...itens];
        });
    
        return adicionado;
    },

    // Remove um produto
    remover: (produtoId: number | string) => {
        cartStore.update((itens) =>
            itens.filter(
                (item) => item.produto.id !== produtoId
            )
        );
    },

    // Atualiza a quantidade de um produto
    atualizarQuantidade: (
        produtoId: number | string,
        novaQuantidade: number
    ) => {
        cartStore.update((itens) => {
            const index = itens.findIndex(
                (item) => item.produto.id === produtoId
            );

            if (index !== -1) {
                const limite = itens[index].produto.quantidade_disponivel;

                itens[index].quantidade = Math.max(
                    1,
                    Math.min(novaQuantidade, limite)
                );
            }

            return [...itens];
        });
    },

    // Limpa o carrinho do usuário atual
    limpar: () => {
        cartStore.set([]);
    }
};
