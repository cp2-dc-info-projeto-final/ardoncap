
<script lang="ts">
    import { onMount } from 'svelte';
    import api from '$lib/api';
    import type { ApiResponse } from '$lib/api';
    import type { Produto } from '$lib/models/Produto';
    import { page } from '$app/stores';
  
    interface Categoria {
      id: number;
      nome: string;
    }
  
    type ProdutoListagem = Produto & {
      categoria_nome?: string;
    };
  
    let produtos: ProdutoListagem[] = [];
    let categorias: Categoria[] = [];
  
    let search = '';
    let idCategoria: number | '' = '';
  
    let loading = true;
    let error = '';
    let erroCategorias = '';
  
    // Evita que respostas antigas sobrescrevam filtros mais recentes
    let requisicaoAtual = 0;
  
    // Busca produtos com filtros opcionais
    async function loadProdutos() {
      const requisicao = ++requisicaoAtual;
  
      loading = true;
      error = '';
  
      try {
        const params: {
          search?: string;
          id_categoria?: string;
        } = {};
  
        if (search.trim()) {
          params.search = search.trim();
        }
  
        if (idCategoria) {
          params.id_categoria = idCategoria;
        }
  
        const res = await api.get('/produtos', { params });
  
        const body = res.data as ApiResponse<ProdutoListagem[]>;
  
        if (body.success) {
          produtos = body.data ?? [];
        } else {
          error = body.message || 'Erro ao buscar produtos.';
        }
  
      } catch (e: any) {
        console.error('Erro ao carregar produtos:', e);
  
        const body = e.response?.data as
          ApiResponse<ProdutoListagem[]> | undefined;
  
        error = body?.message || 'Erro ao carregar produtos.';
  
      } finally {
        if (requisicao === requisicaoAtual) {
          loading = false;
        }
      }
    }
  
    // Busca todas as categorias disponíveis
    async function loadCategorias() {
      try {
        const res = await api.get('/categorias');
  
        const body = res.data as ApiResponse<Categoria[]>;
  
        if (body.success) {
          categorias = body.data ?? [];
        } else {
          erroCategorias = 'Não foi possível carregar as categorias.';
        }
  
      } catch (e) {
        console.error('Erro ao carregar categorias:', e);
        erroCategorias = 'Não foi possível carregar as categorias.';
      }
    }
  
    // Aplica os filtros selecionados
    function aplicarFiltros() {
      loadProdutos();
    }
  
    // Limpa os filtros e carrega todos os produtos
    function limparFiltros() {
      search = '';
      idCategoria = '';
      loadProdutos();
    }
  
    
    onMount(async () => {
    const categoriaUrl = $page.url.searchParams.get('id_categoria');

      idCategoria = categoriaUrl ? Number(categoriaUrl) : '';

      await Promise.all([
        loadProdutos(),
        loadCategorias()
      ]);
    });
  </script>
  
  <div class="w-full max-w-6xl mx-auto px-4 my-8 font-poppins">
  
    <!-- FILTROS -->
    <form
      class="flex flex-col md:flex-row gap-3 mb-8"
      on:submit|preventDefault={aplicarFiltros}
    >
  
      <!-- Pesquisa por nome -->
      <input
        type="text"
        bind:value={search}
        placeholder="Pesquisar produtos..."
        class="flex-1 border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
      />
  
      <!-- Seleção de categoria -->
      <select
        bind:value={idCategoria}
        class="w-full md:w-56 border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900"
      >
        <option value="">Todas as categorias</option>
  
        {#each categorias as categoria}
          <option value={categoria.id}>
            {categoria.nome}
          </option>
        {/each}
      </select>
  
      <!-- Botões -->
      <div class="flex gap-2">
        <button
          type="submit"
          class="flex-1 bg-neutral-900 text-white px-5 py-3 text-sm hover:bg-neutral-700 transition-colors"
        >
          Filtrar
        </button>
  
        <button
          type="button"
          on:click={limparFiltros}
          class="flex-1 border border-neutral-300 px-5 py-3 text-sm hover:bg-neutral-100 transition-colors"
        >
          Limpar
        </button>
      </div>
    </form>
  
    {#if erroCategorias}
      <p class="text-sm text-red-500 mb-4">
        {erroCategorias}
      </p>
    {/if}
  
    <!-- LISTAGEM -->
    {#if loading}
  
      <div class="my-12 text-center text-gray-400 animate-pulse">
        Carregando produtos...
      </div>
  
    {:else if error}
  
      <div class="my-12 text-center text-red-500">
        {error}
      </div>
  
    {:else if produtos.length === 0}
  
      <div class="my-12 text-center text-gray-500">
        Nenhum produto encontrado.
      </div>
  
    {:else}
  
      <p class="text-xs text-neutral-500 mb-4">
        {produtos.length}
        {produtos.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
      </p>
  
      <!-- GRID RESPONSIVO -->
      <ul class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
  
        {#each produtos as produto (produto.id)}
  
          <li>
            <a
              href="/produto/{produto.id}"
              class="group flex flex-col h-full items-center justify-between gap-3 p-4 bg-white border border-neutral-100 transition-all duration-300 hover:bg-neutral-900"
            >
  
              <!-- IMAGEM -->
              <div class="w-full aspect-square flex items-center justify-center overflow-hidden bg-white p-2">
  
                {#if produto.imagem}
                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                    class="max-w-full max-h-full object-contain"
                    loading="lazy"
                  />
                {:else}
                  <span class="text-xs text-neutral-500">
                    Sem foto
                  </span>
                {/if}
  
              </div>
  
              <!-- INFORMAÇÕES -->
              <div class="flex flex-col w-full text-center gap-1">
  
                <span class="text-xs text-black uppercase font-medium tracking-wide truncate group-hover:text-white">
                  {produto.nome}
                </span>
  
                {#if produto.categoria_nome}
                  <span class="text-[0.65rem] text-neutral-400 uppercase group-hover:text-neutral-300">
                    {produto.categoria_nome}
                  </span>
                {/if}
  
                {#if produto.preco !== null && produto.preco !== undefined}
                  <span class="text-sm text-neutral-500 mt-1 group-hover:text-neutral-300">
                    {Number(produto.preco).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </span>
                {/if}
  
              </div>
  
            </a>
          </li>
  
        {/each}
  
      </ul>
  
    {/if}
  
  </div>
  