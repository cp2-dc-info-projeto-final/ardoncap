<script lang="ts">
    export let search = '';
    
    // Tabela de produto
    import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Card, Badge, Button } from 'flowbite-svelte'; // UI
    import ConfirmModal from './ConfirmModal.svelte'; // modal de confirmação
    import { UserEditOutline, TrashBinOutline, ArrowLeftOutline, FloppyDiskAltOutline, UndoOutline } from 'flowbite-svelte-icons'; // ícones
    import { goto } from '$app/navigation'; // navegação
    import api from '$lib/api'; // API backend
    import type { ApiResponse } from '$lib/api';
    import { onMount } from 'svelte'; // ciclo de vida
    import type { Produto } from '$lib/models/Produto';

    let produtos: Produto[] = [];   // get de produtos
    export let id: number | null = null;
  
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

    // Retorna ao painel
    function painel() {
      goto('/painel');
    }
  
    async function handleDelete(id: number) {
      deletingId = id;
      error = '';
      try {
        const res = await api.delete(`/produtos/${id}`);
        const body = res.data as ApiResponse<null>;
        if (!body.success) {
          error = body.message;
          return;
        }
        produtos = produtos.filter(produto => produto.id !== id);
      } catch (e: any) {
        console.error('Erro ao deletar produto:', e);
        const body = e.response?.data as ApiResponse<null> | undefined;
        error = body?.message || 'Erro ao remover produto.';
      } finally {
        deletingId = null;
      }
    }
  
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
        error = body?.message || 'Erro ao carregar Produtos';
      } finally {
        loading = false;
      }
    });
  </script>
  
  {#if loading}
    <div class="my-8 text-center text-black">Carregando produtos...</div>
  {:else if error}
    <div class="my-8 text-center text-red-500">{error}</div>
  {:else}
    <!-- Tabela para telas médias/grandes -->
    <div class= "w-full max-w-3xl mx-auto my-8 rounded-xl overflow-y-auto border border-gray-300 hidden xl:block">
      <!-- Tabela de produtos -->
      <Table class="w-full table-fixed border-separate border-spacing-0">
        <TableHead class="sticky top-0 z-0">
          <TableHeadCell class="text-black w-16 bg-gray-300 font-poppins">ID</TableHeadCell>
          <TableHeadCell class="text-black w-32 bg-gray-300 font-poppins">Nome</TableHeadCell>
          <TableHeadCell class="text-black w-28 bg-gray-300 font-poppins">Categoria</TableHeadCell>
          <TableHeadCell class="text-black w-20 bg-gray-300 font-poppins">Preço</TableHeadCell>
          <TableHeadCell class="text-black w-16 bg-gray-300 font-poppins">Qtd</TableHeadCell>
          <TableHeadCell class="text-black w-24 bg-gray-300 font-poppins">User</TableHeadCell>
          <TableHeadCell class="w-24 bg-gray-300"></TableHeadCell> <!-- coluna para editar/remover -->
        </TableHead>
        <TableBody>
          {#if produtos.length === 0}
            <TableBodyRow>
              <TableBodyCell colspan="7" class="text-center text-gray-400 py-8">
                Nenhum produto encontrado.
              </TableBodyCell>
            </TableBodyRow>
          {:else}
            {#each produtos as produto}
              <TableBodyRow>
                <TableBodyCell class="text-black truncate">{produto.id}</TableBodyCell>
                <TableBodyCell class="text-black truncate">{produto.nome}</TableBodyCell>
                <TableBodyCell class="text-black truncate">{produto.categoria_nome}</TableBodyCell>
                <TableBodyCell class="text-black truncate">{produto.preco}</TableBodyCell>
                <TableBodyCell class="text-black truncate">{produto.quantidade_disponivel}</TableBodyCell>
                <TableBodyCell class="text-black truncate">{produto.id_usuario}</TableBodyCell>
                <TableBodyCell>
                  <!-- Botão editar -->
                  <button
                    class="p-2 rounded border border-black hover:border-gray-300 transition bg-transparent"
                    title="Editar"
                    on:click={() => goto(`/produtos/edit/${produto.id}`)}
                  >
                    <UserEditOutline class="w-5 h-5 text-black" />
                  </button>
                  <!-- Botão remover -->
                  <button
                    title="Remover"
                    class="p-2 rounded border border-black hover:border-gray-300 transition bg-transparent"
                    on:click={() => openConfirm(produto.id)}
                    disabled={deletingId === produto.id || loading}
                  >
                    <TrashBinOutline class="w-5 h-5 text-black" />
                  </button>
                </TableBodyCell>
              </TableBodyRow>
            {/each}
          {/if}
        </TableBody>
      </Table>
    </div>
    <!-- Cards para telas pequenas -->
    <div class="block xl:hidden">
      <div class="flex flex-col items-center gap-4 my-8 max-w-3xl mx-auto md:grid md:grid-cols-2">
        {#each produtos as produto}
          <!-- Card de usuário -->
          <Card class=" w-full p-0 overflow-hidden shadow-lg border-gray-200">
            <div class="px-4 pt-4 pb-2 bg-gray-100 text-left flex items-center justify-between">
              <div>
                <div class="text-lg font-semibold text-gray-800 text-left">{produto.nome}</div>
                <div class="text-xs text-gray-400 text-left">ID: {produto.id}</div>
                <div class="text-xs text-gray-400 text-left">Categoria: {produto.categoria_nome}</div>
                <div class="text-xs text-gray-400 text-left">Preço: {produto.preco}</div>
                <div class="text-xs text-gray-400 text-left">Qtd.: {produto.quantidade_disponivel}</div>
                <div class="text-xs text-gray-400 text-left">User: {produto.id_usuario}</div>
              </div>
              <div class="flex gap-2">
                <!-- Botão editar -->
                <button
                  class="p-2 rounded border border-black hover:border-gray-300 transition bg-transparent"
                  title="Editar"
                  on:click={() => goto(`/produtos/edit/${produto.id}`)}
                >
                  <UserEditOutline class="w-5 h-5 text-black" />
                </button>
                <!-- Botão remover -->
                <button
                  title="Remover"
                  class="p-2 rounded border border-black hover:border-gray-300 transition bg-transparent"
                  on:click={() => openConfirm(produto.id)}
                  disabled={deletingId === produto.id || loading}
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
    message="Tem certeza que deseja remover esta produto?"
    confirmText="Remover"
    cancelText="Cancelar"
    onConfirm={handleConfirm}
    onCancel={handleCancel}
  />

<!-- Botão de voltar -->
<div class="flex gap-4 justify-center mt-4">
  <Button color="light" type="button" onclick={painel} disabled={loading} class="font-special flex items-center justify-center">
    <UndoOutline class="w-5 h-5 font-special" />
  </Button>
</div>


