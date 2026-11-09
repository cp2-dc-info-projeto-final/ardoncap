<script lang="ts">
  import { Card } from 'flowbite-svelte'; // UI
  import api from '$lib/api'; // API backend
  import type { ApiResponse } from '$lib/api';
  import { onMount } from 'svelte'; // ciclo de vida
  import type { Produto } from '$lib/models/Produto';

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
  <div class="my-12 text-center text-gray-400 font-poppins animate-pulse">Carregando produtos...</div>
{:else if error}
  <div class="my-12 text-center text-red-500 font-poppins">{error}</div>
{:else if produtos.length === 0}
  <div class="my-12 text-center text-gray-500 font-poppins">Nenhum produto encontrado.</div>
{:else}
  <!-- Versão Grid Minimalista (Telas Médias e Grandes) -->
  <div class="hidden md:block w-full max-w-3xl mx-auto my-8 px-4">
    <ul class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 gap-1 font-poppins">
      {#each produtos as produto}
        <li>
          <a 
            class="group flex flex-col items-center justify-between p-4 rounded-none bg-white transition-all duration-300 hover:scale-[1.03] hover:bg-neutral-900 text-center h-full gap-3" 
            href="/produto/{produto.id}"
          >
            <!-- Container Imagem -->
            <div class="w-30 h-30 overflow-hidden bg-white flex items-center justify-center p-1 group-hover:bg-black transition-colors">
              {#if produto.imagem}
                <img 
                  src={produto.imagem} 
                  alt={produto.nome} 
                  class="max-w-full max-h-full object-contain"
                />
              {:else}
                <div class="text-[0.6rem] text-neutral-600 uppercase tracking-tighter">Sem foto</div>
              {/if}
            </div>      
            
            <!-- Detalhes do Produto -->
            <div class="flex flex-col w-full">
              <span class="text-xs text-black uppercase font-medium tracking-wide truncate max-w-full">
                {produto.nome}
              </span>
              {#if produto.preco}
                <span class="text-[0.8rem] text-neutral-400 mt-1 font-poppins">
                  {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              {/if}
            </div>
          </a>                  
        </li>
      {/each}
    </ul>
  </div>

<!-- Apenas Telas Pequenas -->
<div class="block md:hidden w-full px-4 my-8">
  <div class="flex flex-col gap-3 max-w-md mx-auto">
    {#each produtos as produto}
      <Card class="w-full p-0 overflow-hidden bg-white rounded-none transition-colors">
        <a href="/produto/{produto.id}" class="flex items-center gap-4 p-3 group">
          <!-- Miniatura da Imagem -->
          <div class="w-12 h-12 bg-neutral-900 rounded-none flex items-center justify-center overflow-hidden p-1 shrink-0">
            {#if produto.imagem}
              <img src={produto.imagem} alt={produto.nome} class="max-w-full max-h-full object-contain" />
            {:else}
              <div class="text-[0.5rem] text-black uppercase">N/A</div>
            {/if}
          </div>

          <!-- Informações textuais -->
          <div class="flex flex-col justify-center text-left min-w-0 flex-1">
            <div class="text-sm font-special text-black uppercase tracking-wide truncate transition-colors">
              {produto.nome}
            </div>
            {#if produto.preco}
              <div class="text-xs text-black font-poppins mt-0.5">
                {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </div>
            {/if}
          </div>
        </a>
      </Card>
    {/each}
  </div>
</div>
<div class="flex justify-center my-10">
  <a
    href="/todesprodutos"
    class="px-8 py-3 border border-neutral-900 text-neutral-900
           text-sm uppercase tracking-widest
           hover:bg-neutral-900 hover:text-white
           transition-all duration-300"
  >
    Ver todos os produtos
  </a>
</div>
{/if}

