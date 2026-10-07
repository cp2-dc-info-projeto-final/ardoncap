<script lang="ts">
	import { cart } from '$lib/cart';
	import { Card, Button, Heading } from 'flowbite-svelte';
	import { TrashBinOutline, ArrowLeftOutline, CartOutline } from 'flowbite-svelte-icons';
	import { goto } from '$app/navigation';

	// Cálculo síncrono e reativo baseado no estado atual da store de carrinho
	$: totalItens = $cart.reduce((acumulador, item) => acumulador + item.quantidade, 0);
	
	$: valorTotal = $cart.reduce((acumulador, item) => {
		return acumulador + (item.produto.preco * item.quantidade);
	}, 0);

	function voltarParaProdutos() {
		goto('/');
	}

	function finalizarCompra() {
		goto('/checkout');
	}
</script>

<svelte:head>
	<title>Ardoncap - Meu Carrinho</title>
</svelte:head>

<div class="min-h-screen w-full bg-black text-white px-4 pt-32 pb-12 md:px-8">
	<div class="max-w-4xl mx-auto flex flex-col gap-8">
		
		<!-- Cabeçalho da Página -->
		<div class="flex items-center justify-between pb-4">
			<div class="flex items-center gap-3">
				<CartOutline class="h-8 w-8 text-white" />
				<Heading tag="h2" class="text-white font-instrument text-3xl uppercase tracking-wider">Meu Carrinho</Heading>
			</div>
			<Button 
				class="font-special !flex !items-center text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-lg px-3 py-1.5"
				onclick={voltarParaProdutos}
			>
				<ArrowLeftOutline class="mr-1.5 h-4 w-4" /> CONTINUAR COMPRANDO
			</Button>
		</div>

		{#if $cart.length === 0}
			<!-- Estado Vazio -->
			<div class="flex flex-col items-center justify-center text-center py-20 gap-4">
				<p class="font-poppins text-neutral-500 text-lg">Seu carrinho está vazio no momento.</p>
				<Button 
					class="font-special bg-white text-black hover:bg-gray-300 rounded-xl px-6 py-2.5 text-sm uppercase tracking-wider"
					onclick={voltarParaProdutos}
				>
					Ver Produtos
				</Button>
			</div>
		{:else}
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
				
				<!-- Lista de Itens do Carrinho -->
				<div class="lg:col-span-2 flex flex-col gap-4">
					{#each $cart as item (item.produto.id)}
						<Card class="w-full p-4 bg-neutral-950 border border-neutral-900 rounded-2xl flex flex-row items-center gap-4 justify-between">
							<div class="flex items-center gap-4 min-w-0 flex-1">
								<!-- Imagem do Produto -->
								<div class="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center p-1 shrink-0 overflow-hidden">
									{#if item.produto.imagem}
										<img src={item.produto.imagem} alt={item.produto.nome} class="max-w-full max-h-full object-contain" />
									{:else}
										<span class="text-[0.5rem] text-neutral-600 uppercase">N/A</span>
									{/if}
								</div>

								<!-- Informações Textuais -->
								<div class="flex flex-col min-w-0">
									<span class="font-special text-sm uppercase tracking-wide truncate text-gray-100">{item.produto.nome}</span>
									<span class="font-poppins text-xs text-neutral-500 mt-0.5">
										{item.produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} / un
									</span>
								</div>
							</div>

							<!-- Controles de Quantidade e Ação -->
							<div class="flex items-center gap-6 shrink-0">
								<!-- Seleção de Quantidade -->
								<div class="flex items-center border border-neutral-800 bg-neutral-900 rounded-xl overflow-hidden">
									<button 
										class="px-3 py-1 hover:bg-neutral-800 text-neutral-400 font-bold transition-colors"
										onclick={() => cart.atualizarQuantidade(item.produto.id, item.quantidade - 1)}
									>
										-
									</button>
									<span class="px-2 font-poppins text-xs w-8 text-center text-white">
										{item.quantidade}
									</span>
									<button 
										class="px-3 py-1 hover:bg-neutral-800 text-neutral-400 font-bold transition-colors"
										onclick={() => cart.atualizarQuantidade(item.produto.id, item.quantidade + 1)}
									>
										+
									</button>
								</div>

								<!-- Subtotal do Item -->
								<span class="font-poppins text-sm font-semibold hidden sm:inline text-right min-w-[70px]">
									{(item.produto.preco * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
								</span>

								<!-- Remover do Carrinho -->
								<button 
									class="text-neutral-500 hover:text-red-500 transition-colors p-1"
									aria-label="Remover item"
									onclick={() => cart.remover(item.produto.id)}
								>
									<TrashBinOutline class="h-5 w-5" />
								</button>
							</div>
						</Card>
					{/each}

					<!-- Botão para Limpar Carrinho -->
					<div class="flex justify-end">
						<button 
							class="font-special text-xs text-neutral-500 hover:text-neutral-300 uppercase tracking-widest"
							onclick={() => cart.limpar()}
						>
							Limpar Todo o Carrinho
						</button>
					</div>
				</div>

				<!-- Resumo do Pedido -->
				<Card class="w-full p-6 bg-neutral-950 border border-neutral-900 rounded-2xl flex flex-col gap-6">
					<span class="font-special text-xs text-neutral-500 tracking-widest uppercase">Resumo da Compra</span>
					
					<div class="flex flex-col gap-3 font-poppins text-sm">
						<div class="flex justify-between text-neutral-400">
							<span>Total de itens:</span>
							<span>{totalItens}</span>
						</div>
						<div class="flex justify-between text-neutral-400">
							<span>Frete:</span>
							<span class="text-green-500 uppercase text-xs tracking-wider font-semibold">Grátis</span>
						</div>
						<div class="border-t border-neutral-900 my-2"></div>
						<div class="flex justify-between items-baseline">
							<span class="font-special text-xs tracking-wider text-neutral-400 uppercase">Total:</span>
							<span class="text-2xl font-bold text-white">
								{valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
							</span>
						</div>
					</div>

					<Button 
						class="font-special w-full bg-white text-black hover:bg-gray-300 rounded-xl text-[1.1rem] py-3 uppercase tracking-wider mt-2"
						onclick={finalizarCompra}
					>
						Finalizar Pedido
					</Button>
				</Card>

			</div>
		{/if}

	</div>
</div>
