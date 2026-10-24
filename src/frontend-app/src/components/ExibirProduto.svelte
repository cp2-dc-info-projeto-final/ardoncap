<script lang="ts">
	import { Card, Button, Heading } from 'flowbite-svelte'; // UI
	import { onMount } from 'svelte'; // ciclo de vida
	import api from '\$lib/api'; // API backend
	import type { ApiResponse } from '\$lib/api';
	import { goto } from '\$app/navigation';
	import { ArrowLeftOutline } from 'flowbite-svelte-icons';
	import type { Produto } from '\$lib/models/Produto';
    import { cart } from '$lib/cart';

	export let id: number | string | null = null;

	let produto: Produto | null = null;
	let loading = true;
	let error = '';

	onMount(async () => {
		if (id !== null) {
			try {
				const res = await api.get(`/produtos/${id}`);
				const body = res.data as ApiResponse<Produto>;
				if (body.success && body.data) {
					produto = body.data;
				} else {
					error = body.message || 'Produto não encontrado.';
				}
			} catch (e: any) {
				const body = e.response?.data as ApiResponse<Produto> | undefined;
				error = body?.message || 'Erro ao carregar o produto.';
			} finally {
				loading = false;
			}
		} else {
			error = 'ID de produto inválido.';
			loading = false;
		}
	});

	function handleBack() {
		goto('/'); 
	}
</script>

<svelte:head>
	<title>Ardoncap - {produto ? produto.nome : 'Visualizar Produto'}</title>
</svelte:head>

<div class="w-full max-w-3xl px-4 md:px-8">
	<div class="flex h-screen flex-col items-center justify-center bg-black p-4">
		<div class="w-full max-w-sm">
			<!-- Card de Visualização -->
			<Card class="pl-0 w-full bg-black border-0">
				<div class="flex flex-col gap-6 p-6">
					
					{#if loading}
						<div class="text-center p-8 text-white font-poppins">Carregando produto...</div>
					{:else if error}
						<div class="text-center text-red-500 font-poppins mb-4">{error}</div>
						<Button
							class="font-special w-full !flex !justify-center !items-center rounded-xl bg-white text-[1.1rem] text-black hover:bg-gray-300"
							onclick={handleBack}
						>
							<ArrowLeftOutline class="mr-2 inline h-5 w-5 align-text-bottom" />
							VOLTAR
						</Button>
					{:else if produto}
						<!-- Imagem do Produto (se existir) -->
						{#if produto.imagem}
							<div class="w-full flex justify-center mb-2">
								<img 
									src={produto.imagem} 
									alt={produto.nome} 
									class="max-h-48 object-contain rounded-2xl border border-neutral-800"
								/>
							</div>
						{/if}

						<!-- Categoria -->
						{#if produto.categoria_nome}
							<div class="text-center">
								<span class="font-special bg-neutral-900 text-gray-400 px-3 py-1 rounded-full text-[0.65rem] tracking-widest uppercase">
									{produto.categoria_nome}
								</span>
							</div>
						{/if}

						<!-- Título com o Nome do Produto -->
						<Heading tag="h3" class="font-instrument text-center text-4xl text-white uppercase mt-2">
							{produto.nome}
						</Heading>

						<!-- Informações do Produto -->
						<div class="flex flex-col gap-4 text-center">
							<div>
								<span class="font-special text-gray-500 block text-xs tracking-wider">PREÇO:</span>
								<span class="font-poppins text-2xl font-bold text-white">
									{produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
								</span>
							</div>

							<div>
								<span class="font-special text-gray-500 block text-xs tracking-wider">DISPONÍVEL:</span>
								<span class="font-poppins text-sm text-white">
									{produto.quantidade_disponivel} unidades
								</span>
							</div>

							{#if produto.descricao}
								<div class="mt-2">
									<span class="font-special text-gray-500 block text-xs tracking-wider">DESCRIÇÃO:</span>
									<p class="font-poppins text-sm text-gray-300 leading-relaxed mt-1">
										{produto.descricao}
									</p>
								</div>
							{/if}
						</div>

                        <div class="mt-6 flex justify-center">
                            <Button 
                            class="w-full bg-white hover:bg-gray-200 text-black rounded-xl font-special"
                            disabled={produto.quantidade_disponivel <= 0}
                            onclick={() => cart.adicionar(produto)}
                            >
                            {#if produto.quantidade_disponivel > 0}
                                ADICIONAR AO CARRINHO
                            {:else}
                                ESGOTADO
                            {/if}
                            </Button>
                        </div>

						<!-- Botão de Voltar -->
						<div class="mt-6 flex justify-center">
							<Button
								class="font-special w-full !flex !justify-center !items-center rounded-xl bg-white text-[1.1rem] text-black hover:bg-gray-200"
								onclick={handleBack}
							>
								<ArrowLeftOutline class="mr-2 inline h-5 w-5 align-text-bottom" />
								VOLTAR
							</Button>
						</div>
					{/if}
					
				</div>
			</Card>
		</div>
	</div>
</div>
