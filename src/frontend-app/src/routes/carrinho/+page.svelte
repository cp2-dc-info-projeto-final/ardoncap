
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
                <Heading tag="h2" class="text-white font-instrument text-3xl uppercase tracking-wider">
                    Meu Carrinho
                </Heading>
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
                <p class="font-poppins text-neutral-500 text-lg">
                    Seu carrinho está vazio no momento.
                </p>

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

						<Card class="w-full !p-5 bg-neutral-950 border border-neutral-800 rounded-xl flex flex-row items-center justify-between gap-5">

							<!-- Produto -->
							<div class="flex items-center gap-5 min-w-0 flex-1">

								<!-- Imagem -->
								<div class="w-24 h-24 bg-neutral-900 border border-neutral-800 flex items-center justify-center p-2 shrink-0 overflow-hidden">
									{#if item.produto.imagem}
										<img
											src={item.produto.imagem}
											alt={item.produto.nome}
											class="max-w-full max-h-full object-contain"
										/>
									{:else}
										<span class="text-xs text-neutral-600 uppercase">N/A</span>
									{/if}
								</div>

								<!-- Informações -->
								<div class="flex flex-col min-w-0 gap-3">

									<!-- Nome do produto -->
									<span class="font-special text-sm md:text-base uppercase tracking-wider text-white whitespace-normal break-words leading-relaxed">
										{item.produto.nome}
									</span>

									<!-- Valor unitário -->
									<div class="flex flex-col gap-1">
										<span class="font-poppins text-[0.65rem] uppercase tracking-widest text-neutral-500">
											Preço por unidade
										</span>

										<span class="font-poppins text-sm text-neutral-300">
											{item.produto.preco.toLocaleString('pt-BR', {
												style: 'currency',
												currency: 'BRL'
											})}
										</span>
									</div>

								</div>
							</div>

							<!-- Quantidade e valores -->
							<div class="flex flex-col items-end gap-3 shrink-0">

								<!-- Quantidade -->
								<div class="flex items-center border border-neutral-700 bg-neutral-900 overflow-hidden">
									<button
										class="px-3 py-2 hover:bg-neutral-800 text-neutral-400 hover:text-white font-bold transition-colors"
										onclick={() => cart.atualizarQuantidade(item.produto.id, item.quantidade - 1)}
									>
										-
									</button>

									<span class="px-3 font-poppins text-sm w-10 text-center text-white">
										{item.quantidade}
									</span>

									<button
										class="px-3 py-2 hover:bg-neutral-800 text-neutral-400 hover:text-white font-bold transition-colors"
										onclick={() => cart.atualizarQuantidade(item.produto.id, item.quantidade + 1)}
									>
										+
									</button>
								</div>

								<!-- Subtotal -->
								<div class="text-right">
									<span class="block text-[0.65rem] uppercase tracking-widest text-neutral-500 mb-1">
										Subtotal
									</span>

									<span class="font-poppins text-sm font-semibold text-white whitespace-nowrap">
										{(item.produto.preco * item.quantidade).toLocaleString('pt-BR', {
											style: 'currency',
											currency: 'BRL'
										})}
									</span>
								</div>

							</div>

							<!-- Remover -->
							<button
								class="text-neutral-600 hover:text-red-500 transition-colors p-2 shrink-0"
								aria-label="Remover item"
								onclick={() => cart.remover(item.produto.id)}
							>
								<TrashBinOutline class="h-5 w-5" />
							</button>

						</Card>

					{/each}

				</div>


                <!-- Resumo do Pedido -->
                <Card class="w-full p-6 bg-neutral-950 border border-neutral-900 rounded-2xl flex flex-col gap-6">

                    <span class="font-special text-xs text-neutral-500 tracking-widest uppercase">
                        Resumo da Compra
                    </span>

                    <div class="flex flex-col gap-3 font-poppins text-sm">

                        <div class="flex justify-between text-neutral-400">
                            <span>Total de itens:</span>
                            <span>{totalItens}</span>
                        </div>

                        <div class="flex justify-between text-neutral-400">
                            <span>Frete:</span>
                            <span class="text-green-500 uppercase text-xs tracking-wider font-semibold">
                                Grátis
                            </span>
                        </div>

                        <div class="border-t border-neutral-900 my-2"></div>

                        <div class="flex justify-between items-baseline">
                            <span class="font-special text-xs tracking-wider text-neutral-400 uppercase">
                                Total:
                            </span>

                            <span class="text-2xl font-bold text-white">
                                {valorTotal.toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                })}
                            </span>
                        </div>

                    </div>

                    <Button
                        class="font-special w-full bg-white text-black hover:bg-gray-300 rounded-xl text-[1.1rem] py-3 uppercase tracking-wider mt-2"
                        onclick={finalizarCompra}
                    >
                        Finalizar Pedido
                    </Button>

                    <button
                        class="font-special text-xs text-neutral-500 hover:text-neutral-300 uppercase tracking-widest flex items-center justify-center gap-1.5"
                        onclick={() => cart.limpar()}
                    >
                        Limpar Todo Carrinho
                    </button>
                </Card>
            </div>
        {/if}
    </div>
</div>
