import { writable } from 'svelte/store';
import type { Produto } from '$lib/models/Produto';

// Interface para o item dentro do carrinho
export interface CartItem {
	produto: Produto;
	quantidade: number;
}

// Verifica se está rodando no navegador antes de acessar o localStorage
const isBrowser = typeof window !== 'undefined';

// Recupera os dados iniciais do localStorage de forma segura
const initialCart: CartItem[] = isBrowser 
	? JSON.parse(localStorage.getItem('addoncap_cart') || '[]') 
	: [];

// Cria a store gravável
const cartStore = writable<CartItem[]>(initialCart);

// Sempre que a store mudar no navegador, salva no localStorage automaticamente
if (isBrowser) {
	cartStore.subscribe((value) => {
		localStorage.setItem('addoncap_cart', JSON.stringify(value));
	});
}

// Funções utilitárias para gerenciar o carrinho
export const cart = {
	subscribe: cartStore.subscribe,

	// Adiciona um produto ou aumenta a quantidade se já existir
	adicionar: (produto: Produto, quantidade = 1) => {
		cartStore.update((itens) => {
			const index = itens.findIndex((item) => item.produto.id === produto.id);

			if (index !== -1) {
				// Verifica se há estoque suficiente disponível
				const novaQuantidade = itens[index].quantidade + quantidade;
				if (novaQuantidade <= produto.quantidade_disponivel) {
					itens[index].quantidade = novaQuantidade;
				} else {
					itens[index].quantidade = produto.quantidade_disponivel;
				}
			} else {
				itens.push({ produto, quantidade: Math.min(quantidade, produto.quantidade_disponivel) });
			}
			return [...itens];
		});
	},

	// Remove totalmente um item do carrinho
	remover: (produtoId: number | string) => {
		cartStore.update((itens) => itens.filter((item) => item.produto.id !== produtoId));
	},

	// Atualiza a quantidade diretamente (ex: via input numérico)
	atualizarQuantidade: (produtoId: number | string, novaQuantidade: number) => {
		cartStore.update((itens) => {
			const index = itens.findIndex((item) => item.produto.id === produtoId);
			if (index !== -1) {
				const limite = itens[index].produto.quantidade_disponivel;
				itens[index].quantidade = Math.max(1, Math.min(novaQuantidade, limite));
			}
			return [...itens];
		});
	},

	// Limpa todo o carrinho (ex: após finalizar a compra)
	limpar: () => {
		cartStore.set([]);
	}
};