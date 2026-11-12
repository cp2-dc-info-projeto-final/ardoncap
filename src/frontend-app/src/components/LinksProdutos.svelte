<script lang="ts">
	import { Card } from 'flowbite-svelte';
	import api from '$lib/api';
	import type { ApiResponse } from '$lib/api';
	import { onMount } from 'svelte';
	import type { Produto } from '$lib/models/Produto';
  import { cart } from '$lib/cart';

	let produtos: Produto[] = [];
	let loading = true;
	let error = '';

	async function loadProdutos() {
		try {
			const res = await api.get('/produtos/recentes');

			const body = res.data as ApiResponse<Produto[]>;

			if (body.success) {
				produtos = body.data ?? [];
			} else {
				error = body.message;
			}
		} catch (e: any) {
			console.error('Erro ao carregar produtos:', e);

			const body = e.response?.data as ApiResponse<Produto[]> | undefined;

			error = body?.message || 'Erro ao carregar produtos';
		} finally {
			loading = false;
		}
	}

	onMount(async () => {
		await loadProdutos();
	});
</script>

{#if loading}
	<div class="font-poppins my-12 animate-pulse text-center text-gray-400">
		Carregando produtos...
	</div>
{:else if error}
	<div class="font-poppins my-12 text-center text-red-500">
		{error}
	</div>
{:else if produtos.length === 0}
	<div class="font-poppins my-12 text-center text-gray-500">Nenhum produto encontrado.</div>
{:else}
	<!-- Versão Grid Minimalista (Telas Médias e Grandes) -->
	<div class="mx-auto my-8 hidden w-full max-w-3xl px-4 md:block">
		<ul
			class="font-poppins grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4"
		>
			{#each produtos as produto}
				<li>
					<a
						class="group flex h-full flex-col items-center justify-between
                   gap-3 rounded-none bg-white
                   p-4 text-center
                 text-black transition-colors
                   duration-300 hover:bg-neutral-900 hover:text-white"
						href={`/produto/${produto.id}?from=linksProdutos`}
					>
						<div class="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden bg-transparent">
							{#if produto.imagem}
								<img
									src={produto.imagem}
									alt={produto.nome}
									class="block h-full w-full object-contain"
								/>
							{:else}
								<div class="text-[0.6rem] text-neutral-600 uppercase tracking-tighter group-hover:text-white">
									Sem foto
								</div>
							{/if}
						</div>

						<!-- Detalhes do Produto -->
          <div class="flex w-full flex-col items-start text-left">

            <span
              class="max-w-full truncate text-left text-xs font-medium
                    tracking-wide text-black uppercase
                    transition-colors duration-300
                    group-hover:text-white"
            >
              {produto.nome}
            </span>

            <div class="mt-2 flex w-full items-center justify-between">

              {#if produto.preco}
                <span
                  class="font-poppins text-left text-[0.8rem] text-neutral-500
                        transition-colors duration-300
                        group-hover:text-white"
                >
                  {produto.preco.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </span>
              {/if}

              <button
                type="button"
                onclick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  cart.adicionar(produto);
                }}
                class="flex items-center justify-center p-1
                      text-neutral-700 transition-colors
                      hover:text-black group-hover:text-white"
                aria-label="Adicionar {produto.nome} ao carrinho"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.7"
                  stroke="currentColor"
                  class="h-4 w-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.085.836L5.25 6.75m0 0h14.25l-1.5 9H6.75l-1.5-9Zm0 0L4.5 3m3.75 15.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm9 0a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z"
                  />
                </svg>
              </button>

            </div>
          </div>
					</a>
				</li>
			{/each}
		</ul>
	</div>
	
<!-- Versão Mobile: 2 produtos por linha -->
<div class="my-8 block w-full px-4 md:hidden">
	<div class="mx-auto grid max-w-md grid-cols-2 gap-2">

		{#each produtos as produto}
			<a
				href={`/produto/${produto.id}?from=linksProdutos`}
				class="group flex h-full flex-col items-center justify-between
                       gap-3 bg-white p-3 text-center
                       transition-colors duration-300
                       hover:bg-neutral-900"
			>
				<!-- Imagem -->
				<div class="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden bg-transparent">
					{#if produto.imagem}
						<img
							src={produto.imagem}
							alt={produto.nome}
							class="block h-full w-full object-contain"
						/>
					{:else}
						<div class="text-[0.6rem] text-neutral-600 uppercase">
							Sem foto
						</div>
					{/if}
				</div>

				<!-- Informações -->
				<div class="flex w-full flex-col">
					<span
						class="truncate text-xs font-medium tracking-wide text-black
                               uppercase transition-colors duration-300
                               group-hover:text-white"
					>
						{produto.nome}
					</span>

					{#if produto.preco}
						<span
							class="mt-1 font-poppins text-xs text-neutral-400
                                   transition-colors duration-300
                                   group-hover:text-white"
						>
							{produto.preco.toLocaleString('pt-BR', {
								style: 'currency',
								currency: 'BRL'
							})}
						</span>
					{/if}
				</div>
			</a>
		{/each}

	</div>
</div>

<!-- Botão Ver Todos -->
<div class="my-10 flex justify-center">
    <a
        href="/todesprodutos"
        class="border border-neutral-800 bg-neutral-950 rounded-lg
               px-8 py-3 text-sm font-special tracking-widest
               text-white uppercase transition-all duration-300
               hover:bg-neutral-800 hover:border-neutral-700"
    >
        Ver todos os produtos
    </a>
</div>
{/if}