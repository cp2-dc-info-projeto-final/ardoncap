
<script lang="ts">
	import { Card, Button, Heading } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import api from '$lib/api';
	import type { ApiResponse } from '$lib/api';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { ArrowLeftOutline } from 'flowbite-svelte-icons';
	import type { Produto } from '$lib/models/Produto';
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
		const origem = $page.url.searchParams.get('from');

		if (origem === 'profile') {
			goto('/profile');
		} else if (origem === 'LinksProdutos') {
			goto('/LinksProdutos');
		} else {
			goto('/');
		}
	}
</script>

<svelte:head>
	<title>Ardoncap - {produto ? produto.nome : 'Visualizar Produto'}</title>
</svelte:head>

<div class="min-h-screen w-full bg-black px-5 py-10 md:px-12">

	<div class="mx-auto flex min-h-[85vh] max-w-6xl items-center justify-center">

		<div class="w-full">

			{#if loading}

				<div class="py-20 text-center">
					<p class="font-poppins text-sm text-neutral-400">
						Carregando produto...
					</p>
				</div>

			{:else if error}

				<div class="mx-auto flex max-w-md flex-col items-center gap-8 text-center">
					<p class="font-poppins text-sm text-neutral-300">{error}</p>

					<Button
						class="!bg-white !text-black font-special uppercase tracking-widest hover:!bg-neutral-300"
						onclick={handleBack}
					>
						<ArrowLeftOutline class="mr-2 h-5 w-5" />
						VOLTAR
					</Button>
				</div>

			{:else if produto}

				<!-- Conteúdo horizontal -->
				<div class="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">

					<!-- Imagem -->
					<div class="flex min-h-[300px] items-center justify-center md:min-h-[500px]">
						{#if produto.imagem}
							<img
								src={produto.imagem}
								alt={produto.nome}
								class="max-h-[500px] w-full object-contain"
							/>
						{:else}
							<div class="font-special text-xs tracking-widest text-neutral-600">
								SEM IMAGEM
							</div>
						{/if}
					</div>

					<!-- Informações -->
					<div class="flex flex-col gap-8">

						<!-- Categoria -->
						{#if produto.categoria_nome}
							<span class="font-special text-xs uppercase tracking-[0.3em] text-neutral-400">
								{produto.categoria_nome}
							</span>
						{/if}

						<!-- Nome -->
						<div class="space-y-4">
							<Heading
								tag="h1"
								class="!m-0 font-instrument font-light text-5xl uppercase leading-[1.05] !text-white md:text-6xl"
							>
								{produto.nome}
							</Heading>
						</div>

						<!-- Preço -->
						<div class="space-y-2">
							<span class="font-special text-[0.7rem] tracking-[0.25em] text-neutral-500">
								PREÇO
							</span>

							<p class="font-poppins text-3xl font-semibold text-white">
								{produto.preco.toLocaleString('pt-BR', {
									style: 'currency',
									currency: 'BRL'
								})}
							</p>
						</div>

						<!-- Disponibilidade -->
						<div class="flex items-center gap-3">
							<span class="font-special text-[0.7rem] tracking-[0.2em] text-neutral-500">
								DISPONÍVEL
							</span>

							<span class="font-poppins text-sm text-white">
								{produto.quantidade_disponivel} unidades
							</span>
						</div>

						<!-- Descrição -->
						{#if produto.descricao}
							<div class="max-w-lg space-y-3">
								<span class="font-special text-[0.7rem] tracking-[0.25em] text-neutral-500">
									DESCRIÇÃO
								</span>

								<p class="font-poppins text-sm leading-7 text-neutral-300">
									{produto.descricao}
								</p>
							</div>
						{/if}

						<!-- Ações -->
						<div class="flex flex-col gap-4 pt-3 sm:flex-row">

							<Button
								class="w-full !rounded-none !bg-white !py-3 font-special text-xs tracking-[0.15em] !text-black hover:!bg-neutral-300"
								disabled={produto.quantidade_disponivel <= 0}
								onclick={() => cart.adicionar(produto)}
							>
								{#if produto.quantidade_disponivel > 0}
									ADICIONAR AO CARRINHO
								{:else}
									ESGOTADO
								{/if}
							</Button>

							<Button
								class="w-full !rounded-none !border !border-neutral-700 !bg-transparent !py-3 font-special text-xs tracking-[0.15em] !text-white hover:!border-white hover:!bg-neutral-900"
								onclick={handleBack}
							>
								<ArrowLeftOutline class="mr-2 h-4 w-4" />
								VOLTAR
							</Button>

						</div>

					</div>
				</div>

			{/if}

		</div>
	</div>
</div>