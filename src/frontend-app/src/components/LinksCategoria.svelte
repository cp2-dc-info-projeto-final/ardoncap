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
    import type { Categoria } from '$lib/models/Categoria';
  
    let categorias: Categoria[] = [];   // lista de usuários
  
    $: loadCategorias(search);
    async function loadCategorias(searchTerm: string) {
      loading = false;
      try {
        const res = await api.get('/categorias', {
          params: {
            search: searchTerm
          }
        });
    
        const body = res.data as ApiResponse<Categoria[]>;
        if (body.success) {
          categorias = body.data ?? [];
        } else {
          error = body.message;
        }
      } catch (e: any) {
        console.error('Erro ao carregar categorias:', e);
    
        const body = e.response?.data as ApiResponse<Categoria[]> | undefined;
        error = body?.message || 'Erro ao carregar categorias';
      } finally {
        loading = false;
      }
    }
  
    let loading = true;
    let error = '';
    
    onMount(async () => {
      try {
        const res = await api.get('/categorias');
        const body = res.data as ApiResponse<Categoria[]>;
        if (body.success) {
          categorias = body.data ?? [];
        } else {
          error = body.message;
        } 
      } catch (e: any) {
        console.error('Erro ao carregar usuários:', e);
        const body = e.response?.data as ApiResponse<Categoria[]> | undefined;
        error = body?.message || 'Erro ao carregar categorias';
      } finally {
        loading = false;
      }
    });
  </script>
  
  {#if loading}
    <div class="my-8 text-center text-black">Carregando categorias...</div>
  {:else if error}
    <div class="my-8 text-center text-red-500">{error}</div>
  {:else}
    <!-- Tabela para telas médias/grandes -->
    <div class="hidden xl:block">
      <!-- Tabela de usuários -->
      <ul class="w-full max-w-5xl mx-auto my-8 flex flex-wrap gap-7 font-special">
          {#each categorias as categoria}
                <li>
                    <a class="text-gray-400  hover:text-white text-2xl hover:text-3xl transition-all" href="/">{categoria.nome}</a>
                </li>
          {/each}
    </ul>
    </div>
    <!-- Cards para telas pequenas -->
    <div class="block xl:hidden">
      <div class="flex flex-col justify-center items-center gap-4 my-8 max-w-3xl mx-auto md:grid md:grid-cols-2">
        {#each categorias as categoria}
          <!-- Card de categorias -->
          <Card class="max-w-sm w-full p-0 overflow-hidden bg-null border-0">
            <div class="px-4 pt-4 pb-2 text-left flex items-center justify-between">
              <div>
                <div class="text-lg hover:text-2xl font-special text-gray-100 transition-all"><a href="/">{categoria.nome}</a></div>
              </div>
              <div class="flex gap-2">
              </div>
            </div>
          </Card>
        {/each}
      </div>
    </div>
  {/if}