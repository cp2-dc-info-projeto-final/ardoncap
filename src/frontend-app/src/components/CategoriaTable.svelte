<script lang="ts">
    export let search = '';
    
    // Tabela de usuários
    import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Card, Badge } from 'flowbite-svelte'; // UI
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
    <div class="hidden xl:block w-full max-w-5xl mx-auto my-8 rounded-xl overflow-hidden border border-gray-300">
      <!-- Tabela de usuários -->
      <Table class="w-full border-separate border-spacing-0">
        <TableHead>
          <TableHeadCell class="text-black w-16 bg-gray-300">ID</TableHeadCell>
          <TableHeadCell class="text-black w-32 bg-gray-300">Nome</TableHeadCell> 
          <TableHeadCell class="w-40 bg-gray-300 text-right"></TableHeadCell> <!-- coluna para editar/remover -->
        </TableHead>
        <TableBody>
          {#each categorias as categoria}
            <TableBodyRow>
              <TableBodyCell class="text-black">{categoria.id}</TableBodyCell>
              <TableBodyCell class="text-black">{categoria.nome}</TableBodyCell>
              <TableBodyCell class="w-40 text-right">
                <!-- Botão editar -->
                <button
                  class="p-2 rounded border border-black hover:border-gray-300 transition bg-transparent"
                  title="Editar"
                  on:click={() => goto(`/categorias/edit/${categoria.id}`)}
                >
                  <UserEditOutline class="w-5 h-5 text-black" />
                </button>
                <!-- Botão remover -->
                <button
                  title="Remover"
                  class="p-2 rounded border border-black hover:border-gray-300 transition bg-transparent "
                  on:click={() => openConfirm(categoria.id)}
                  disabled={deletingId === categoria.id || loading}
                >
                  <TrashBinOutline class="w-5 h-5 text-black" />
                </button>
              </TableBodyCell>
            </TableBodyRow>
          {/each}
        </TableBody>
      </Table>
    </div>
    <!-- Cards para telas pequenas -->
    <div class="block xl:hidden">
      <div class="flex flex-col items-center gap-4 my-8 max-w-3xl mx-auto md:grid md:grid-cols-2">
        {#each categorias as categoria}
          <!-- Card de usuário -->
          <Card class="max-w-sm w-full p-0 overflow-hidden shadow-lg border-gray-200">
            <div class="px-4 pt-4 pb-2 bg-gray-100 text-left flex items-center justify-between">
              <div>
                <div class="text-lg font-semibold text-gray-800 text-left">{categoria.nome}</div>
                <div class="text-xs text-gray-400 text-left">ID: {categoria.id}</div>
              </div>
              <div class="flex gap-2">
                <!-- Botão editar -->
                <button
                  class="p-2 rounded border border-black hover:border-gray-300 transition bg-transparent"
                  title="Editar"
                  on:click={() => goto(`/categorias/edit/${categoria.id}`)}
                >
                  <UserEditOutline class="w-5 h-5 text-black" />
                </button>
                <!-- Botão remover -->
                <button
                  title="Remover"
                  class="p-2 rounded border border-black hover:border-gray-300 transition bg-transparent"
                  on:click={() => openConfirm(categoria.id)}
                  disabled={deletingId === categoria.id || loading}
                >
                  <TrashBinOutline class="w-5 h-5 text-black" />
                </button>
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