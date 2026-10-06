<script lang="ts">
    export let search = '';
    
    // Tabela de usuários
    import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Card, Badge, A, button } from 'flowbite-svelte'; // UI
    import ConfirmModal from './ConfirmModal.svelte'; // modal de confirmação
    import { UserEditOutline, TrashBinOutline } from 'flowbite-svelte-icons'; // ícones
    import { goto } from '$app/navigation'; // navegação
    import api from '$lib/api'; // API backend
    import type { ApiResponse } from '$lib/api';
    import { onMount } from 'svelte'; // ciclo de vida
    import type { Produto } from '$lib/models/Produto';
  
    let produtos: Produto[] = [];   // lista de usuários
  
    $: loadProdutos(search);
    async function loadProdutos(searchTerm: string) {
      loading = false;
      try {
        const res = await api.get('/produtos', {
          params: {
            search: searchTerm
          }
        });
    
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
  
    let loading = true;
    let error = '';

    onMount(async () => {
      try {
        const res = await api.get('/produtos');
        const body = res.data as ApiResponse<Produto[]>;
        if (body.success) {
          produtos = body.data ?? [];
        } else {
          error = body.message;
        } 
      } catch (e: any) {
        console.error('Erro ao carregar usuários:', e);
        const body = e.response?.data as ApiResponse<Produto[]> | undefined;
        error = body?.message || 'Erro ao carregar produtos';
      } finally {
        loading = false;
      }
    });
  </script>
  
  {#if loading}
    <div class="my-8 text-center text-black">Carregando c...</div>
  {:else if error}
    <div class="my-8 text-center text-red-500">{error}</div>
  {:else}
    <!-- Tabela para telas médias/grandes -->
    <div class="hidden xl:block">
      <!-- Tabela de usuários -->
      <ul class="w-full max-w-5xl mx-auto my-8 flex flex-wrap gap-7 font-special">
          {#each produtos as produto}
                <li>
                  <a class="flex items-center justify-center w-12 h-12 overflow-hidden rounded-lg border border-gray-700 bg-gray-800 transition-all hover:scale-105 hover:border-gray-500" href="/">
                    <img 
                      src={produto.imagem} 
                      alt={produto.nome} 
                      class="w-full h-full object-cover "
                    />
                  </a>                  
                </li>
          {/each}
    </ul>
    </div>
    <!-- Cards para telas pequenas -->
    <div class="block xl:hidden">
      <div class="flex flex-col justify-center items-center gap-4 my-8 max-w-3xl mx-auto md:grid md:grid-cols-2">
        {#each produtos as produto}
          <!-- Card de produtos -->
          <Card class="max-w-sm w-full p-0 overflow-hidden bg-null border-0">
            <div class="px-4 pt-4 pb-2 text-left flex items-center justify-between">
              <div>
                <div class="text-lg hover:text-2xl font-special text-gray-100 transition-all"><a href="/">{produto.nome}</a></div>
              </div>
              <div class="flex gap-2">
              </div>
            </div>
          </Card>
        {/each}
      </div>
    </div>
  {/if}
  