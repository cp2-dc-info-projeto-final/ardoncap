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
      loading = true;
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
    let deletingId: number | null = null; // id em deleção
    let confirmOpen = false; // modal aberto?
    let confirmTargetId: number | null = null; // id alvo do modal
  
    // Abre modal de confirmação
    function openConfirm(id: number) {
      confirmTargetId = id;
      confirmOpen = true;
    }
    // Fecha modal
    function closeConfirm() {
      confirmOpen = false;
      confirmTargetId = null;
    }
  
    // Confirma remoção
    function handleConfirm() {
      if (confirmTargetId !== null) {
        handleDelete(confirmTargetId);
      }
      closeConfirm();
    }
  
    // Cancela remoção
    function handleCancel() {
      closeConfirm();
    }
  
    async function handleDelete(id: number) {
      deletingId = id;
      error = '';
      try {
        const res = await api.delete(`/categorias/${id}`);
        const body = res.data as ApiResponse<null>;
        if (!body.success) {
          error = body.message;
          return;
        }
        categorias = categorias.filter(categoria => categoria.id !== id);
      } catch (e: any) {
        console.error('Erro ao deletar categoria:', e);
        const body = e.response?.data as ApiResponse<null> | undefined;
        error = body?.message || 'Erro ao remover categoria.';
      } finally {
        deletingId = null;
      }
    }
  
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
      <ul class="w-full max-w-5xl mx-auto my-8 flex flex-wrap gap-7">
          {#each categorias as categoria}
                <li>
                    <a class="text-gray-400  hover:text-white text-2xl hover:text-3xl transition-all" href="#">{categoria.nome}</a>
                </li>
          {/each}
    </ul>
    </div>
    <!-- Cards para telas pequenas -->
    <div class="block xl:hidden">
      <div class="flex flex-col justify-center items-center gap-4 my-8 max-w-3xl mx-auto md:grid md:grid-cols-2">
        {#each categorias as categoria}
          <!-- Card de usuário -->
          <Card class="max-w-sm w-full p-0 overflow-hidden shadow-lg border-gray-200">
            <div class="px-4 pt-4 pb-2 bg-gray-100 text-left flex items-center justify-between">
              <div>
                <div class="text-lg font-semibold text-gray-800"><a href="#">{categoria.nome}</a></div>
              </div>
              <div class="flex gap-2">
              </div>
            </div>
          </Card>
        {/each}
      </div>
    </div>
  {/if}
  
  <!-- Modal de confirmação -->
  <ConfirmModal
    open={confirmOpen}
    message="Tem certeza que deseja remover esta categoria?"
    confirmText="Remover"
    cancelText="Cancelar"
    onConfirm={handleConfirm}
    onCancel={handleCancel}
  />