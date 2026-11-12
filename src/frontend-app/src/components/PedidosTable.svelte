<script lang="ts">
    export let search = '';
  
    import {
      Table,
      TableHead,
      TableHeadCell,
      TableBody,
      TableBodyRow,
      TableBodyCell,
      Card,
      Button
    } from 'flowbite-svelte';
  
    import {
      UserEditOutline,
      TrashBinOutline,
      EyeOutline,
      EyeSlashOutline,
      UndoOutline,
      ArrowLeftOutline
    } from 'flowbite-svelte-icons';
  
    import ConfirmModal from './ConfirmModal.svelte';
    import { goto } from '$app/navigation';
    import api from '$lib/api';
    import type { ApiResponse } from '$lib/api';
    import { onMount } from 'svelte';
  
    interface ItemPedido {
      id_item: number;
      id_produto: number;
      nome: string;
      imagem?: string;
      categoria?: string;
      quantidade: number;
      preco_unitario: number;
      subtotal: number;
      status: string;
      id_vendedor: number;
      vendedor: string;
    }
  
    interface Pedido {
      id_pedido: number;
      data_pedido: string;
      status_pedido: string;
      valor: number;
      id_comprador: number;
      comprador: string;
      email_comprador: string;
      rua: string;
      numero: string;
      cidade: string;
      estado: string;
      cep: string;
      complemento?: string;
      items: ItemPedido[];
    }
  
    let pedidos: Pedido[] = [];
  
    let loading = true;
    let error = '';
  
    let deletingId: number | null = null;
  
    let confirmOpen = false;
    let confirmTargetId: number | null = null;
  
    let pedidoExpandido: number | null = null;
  
    // Filtragem dos pedidos
    $: pedidosFiltrados = pedidos.filter((pedido) => {
      const termo = search.toLowerCase();
  
      return (
        String(pedido.id_pedido).includes(termo) ||
        String(pedido.id_comprador).includes(termo) ||
        pedido.comprador?.toLowerCase().includes(termo) ||
        pedido.status_pedido?.toLowerCase().includes(termo)
      );
    });
  
    // Carrega os pedidos administrativos
    async function loadPedidos() {
      loading = true;
      error = '';
  
      try {
        const res = await api.get('/pedidos/admin');
  
        const body = res.data as ApiResponse<Pedido[]>;
  
        if (body.success) {
          pedidos = body.data ?? [];
        } else {
          error = body.message || 'Erro ao carregar pedidos.';
        }
      } catch (e: any) {
        console.error('Erro ao carregar pedidos:', e);
  
        const body = e.response?.data as ApiResponse<Pedido[]> | undefined;
  
        error = body?.message || 'Erro ao carregar pedidos.';
      } finally {
        loading = false;
      }
    }
  
    // Formata valores armazenados em centavos
    function formatarValor(valor: number) {
      return (Number(valor) / 100).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
    }
  
    // Formata data
    function formatarData(data: string) {
      if (!data) return '-';
  
      return new Date(data).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
      });
    }
  
    function toggleDetalhes(id: number) {
      pedidoExpandido = pedidoExpandido === id ? null : id;
    }
  
    // Abre modal
    function openConfirm(id: number) {
      confirmTargetId = id;
      confirmOpen = true;
    }
  
    // Fecha modal
    function closeConfirm() {
      confirmOpen = false;
      confirmTargetId = null;
    }
  
    function handleConfirm() {
      if (confirmTargetId !== null) {
        const id = confirmTargetId;
        closeConfirm();
        handleDelete(id);
      }
    }
  
    function handleCancel() {
      closeConfirm();
    }
  
    // Exclui pedido
    async function handleDelete(id: number) {
      deletingId = id;
      error = '';
  
      try {
        const res = await api.delete(`/pedidos/admin/${id}`);
  
        const body = res.data as ApiResponse<null>;
  
        if (!body.success) {
          error = body.message || 'Erro ao excluir pedido.';
          return;
        }
  
        pedidos = pedidos.filter(
          (pedido) => pedido.id_pedido !== id
        );
  
        if (pedidoExpandido === id) {
          pedidoExpandido = null;
        }
      } catch (e: any) {
        console.error('Erro ao excluir pedido:', e);
  
        const body = e.response?.data as ApiResponse<null> | undefined;
  
        error = body?.message || 'Erro ao excluir pedido.';
      } finally {
        deletingId = null;
      }
    }
  
    // Retorna ao painel
    function painel() {
      goto('/painel');
    }
  
    onMount(() => {
      loadPedidos();
    });
  </script>
  
  {#if loading}
    <div class="my-8 text-center text-white">
      Carregando pedidos...
    </div>
  
  {:else if error}
    <div class="my-8 text-center text-red-500">
      {error}
      <div class="mt-4">
        <Button color="light" onclick={loadPedidos}>
          Tentar novamente
        </Button>
      </div>
    </div>
  
  {:else}
    <!-- Tabela para telas grandes -->
    <div class="w-full max-w-5xl mx-auto my-8 rounded-xl overflow-x-auto border border-gray-700 hidden xl:block">
  
      <Table class="w-full border-separate border-spacing-0">
        <TableHead>
          <TableHeadCell class="text-black bg-gray-300 font-poppins">ID</TableHeadCell>
          <TableHeadCell class="text-black bg-gray-300 font-poppins">Comprador</TableHeadCell>
          <TableHeadCell class="text-black bg-gray-300 font-poppins">Data</TableHeadCell>
          <TableHeadCell class="text-black bg-gray-300 font-poppins">Valor</TableHeadCell>
          <TableHeadCell class="text-black bg-gray-300 font-poppins">Status</TableHeadCell>
          <TableHeadCell class="text-black bg-gray-300 font-poppins">Ações</TableHeadCell>
        </TableHead>
  
        <TableBody>
          {#if pedidosFiltrados.length === 0}
            <TableBodyRow>
              <TableBodyCell colspan={6} class="text-center text-gray-400 py-8">
                Nenhum pedido encontrado.
              </TableBodyCell>
            </TableBodyRow>
          {:else}
            {#each pedidosFiltrados as pedido}
              <TableBodyRow>
                <TableBodyCell class="text-black">
                  {pedido.id_pedido}
                </TableBodyCell>
  
                <TableBodyCell class="text-black truncate">
                  {pedido.comprador}
                </TableBodyCell>
  
                <TableBodyCell class="text-black">
                  {formatarData(pedido.data_pedido)}
                </TableBodyCell>
  
                <TableBodyCell class="text-black">
                  {formatarValor(pedido.valor)}
                </TableBodyCell>
  
                <TableBodyCell class="text-black capitalize">
                  {pedido.status_pedido}
                </TableBodyCell>
  
                <TableBodyCell>
                  <div class="flex gap-2">
                    <!-- Detalhes -->
                    <button
                      class="p-2 rounded border border-black hover:border-gray-400 transition"
                      title="Detalhes"
                      on:click={() => toggleDetalhes(pedido.id_pedido)}
                    >
                      {#if pedidoExpandido === pedido.id_pedido}
                        <EyeSlashOutline class="w-5 h-5 text-black" />
                      {:else}
                        <EyeOutline class="w-5 h-5 text-black" />
                      {/if}
                    </button>
  
                    <!-- Excluir -->
                    <button
                      class="p-2 rounded border border-black hover:border-gray-400 transition"
                      title="Excluir"
                      on:click={() => openConfirm(pedido.id_pedido)}
                      disabled={deletingId === pedido.id_pedido}
                    >
                      <TrashBinOutline class="w-5 h-5 text-black" />
                    </button>
                  </div>
                </TableBodyCell>
              </TableBodyRow>
  
              {#if pedidoExpandido === pedido.id_pedido}
                <TableBodyRow>
                  <TableBodyCell colspan={6} class="bg-gray-100 text-black">
                    <div class="p-4 flex flex-col gap-5">
  
                      <!-- Comprador -->
                      <div>
                        <h3 class="font-semibold mb-2">Comprador</h3>
                        <p>ID: {pedido.id_comprador}</p>
                        <p>Usuário: {pedido.comprador}</p>
                        <p>E-mail: {pedido.email_comprador}</p>
                      </div>
  
                      <!-- Endereço -->
                      <div>
                        <h3 class="font-semibold mb-2">Endereço de entrega</h3>
                        <p>{pedido.rua}, {pedido.numero}</p>
                        <p>{pedido.cidade} - {pedido.estado}</p>
                        <p>CEP: {pedido.cep}</p>
                        {#if pedido.complemento}
                          <p>Complemento: {pedido.complemento}</p>
                        {/if}
                      </div>
  
                      <!-- Produtos -->
                      <div>
                        <h3 class="font-semibold mb-3">Produtos do pedido</h3>
  
                        {#each pedido.items ?? [] as item}
                          <div class="flex items-center gap-4 border-t border-gray-300 py-3">
                            {#if item.imagem}
                              <img
                                src={item.imagem}
                                alt={item.nome}
                                class="w-16 h-16 object-contain rounded bg-white"
                              />
                            {/if}
  
                            <div class="flex-1 min-w-0">
                              <p class="font-semibold">{item.nome}</p>
                              <p class="text-xs text-gray-600">
                                Categoria: {item.categoria || '-'}
                              </p>
                              <p class="text-xs text-gray-600">
                                Vendedor: {item.vendedor}
                              </p>
                              <p class="text-xs text-gray-600">
                                Quantidade: {item.quantidade}
                              </p>
                            </div>
  
                            <div class="text-right text-sm">
                              <p>Unitário: {formatarValor(item.preco_unitario)}</p>
                              <p class="font-semibold">
                                Subtotal: {formatarValor(item.subtotal)}
                              </p>
                              <p class="capitalize text-xs text-gray-600">
                                {item.status}
                              </p>
                            </div>
                          </div>
                        {/each}
                      </div>
  
                    </div>
                  </TableBodyCell>
                </TableBodyRow>
              {/if}
            {/each}
          {/if}
        </TableBody>
      </Table>
    </div>
  
    <!-- Cards para telas pequenas -->
    <div class="block xl:hidden">
      <div class="flex flex-col gap-4 my-8 max-w-3xl mx-auto md:grid md:grid-cols-2">
  
        {#each pedidosFiltrados as pedido}
          <Card class="w-full p-0 overflow-hidden shadow-lg border border-gray-200">
  
            <div class="px-4 pt-4 pb-3 bg-gray-100 text-left">
  
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-lg font-semibold text-gray-800">
                    Pedido #{pedido.id_pedido}
                  </div>
  
                  <div class="text-xs text-gray-500">
                    Comprador: {pedido.comprador}
                  </div>
  
                  <div class="text-xs text-gray-500">
                    {formatarData(pedido.data_pedido)}
                  </div>
  
                  <div class="text-sm font-semibold text-gray-800 mt-2">
                    {formatarValor(pedido.valor)}
                  </div>
  
                  <div class="text-xs text-gray-600 capitalize mt-1">
                    Status: {pedido.status_pedido}
                  </div>
                </div>
  
                <div class="flex gap-2">
                  <button
                    title="Editar"
                    class="p-2 rounded border border-black"
                    on:click={() => editarPedido(pedido.id_pedido)}
                  >
                    <UserEditOutline class="w-5 h-5 text-black" />
                  </button>
  
                  <button
                    title="Excluir"
                    class="p-2 rounded border border-black"
                    on:click={() => openConfirm(pedido.id_pedido)}
                    disabled={deletingId === pedido.id_pedido}
                  >
                    <TrashBinOutline class="w-5 h-5 text-black" />
                  </button>
                </div>
              </div>
  
              <button
                class="flex items-center gap-2 text-xs text-gray-700 mt-4"
                on:click={() => toggleDetalhes(pedido.id_pedido)}
              >
                {#if pedidoExpandido === pedido.id_pedido}
                  <EyeSlashOutline class="w-4 h-4" />
                  Ocultar detalhes
                {:else}
                  <EyeOutline class="w-4 h-4" />
                  Ver detalhes
                {/if}
              </button>
  
              {#if pedidoExpandido === pedido.id_pedido}
                <div class="mt-4 pt-4 border-t border-gray-300 flex flex-col gap-4">
  
                  <div class="text-sm text-gray-700">
                    <p class="font-semibold">Comprador</p>
                    <p>ID: {pedido.id_comprador}</p>
                    <p>{pedido.email_comprador}</p>
                  </div>
  
                  <div class="text-sm text-gray-700">
                    <p class="font-semibold">Endereço</p>
                    <p>{pedido.rua}, {pedido.numero}</p>
                    <p>{pedido.cidade} - {pedido.estado}</p>
                    <p>CEP: {pedido.cep}</p>
                    {#if pedido.complemento}
                      <p>{pedido.complemento}</p>
                    {/if}
                  </div>
  
                  <div>
                    <p class="font-semibold text-sm text-gray-800 mb-2">
                      Produtos
                    </p>
  
                    {#each pedido.items ?? [] as item}
                      <div class="border-t border-gray-300 py-3 flex gap-3">
  
                        {#if item.imagem}
                          <img
                            src={item.imagem}
                            alt={item.nome}
                            class="w-14 h-14 object-contain rounded bg-white"
                          />
                        {/if}
  
                        <div class="flex-1 min-w-0 text-xs text-gray-700">
                          <p class="font-semibold">{item.nome}</p>
                          <p>Vendedor: {item.vendedor}</p>
                          <p>Quantidade: {item.quantidade}</p>
                          <p>Status: {item.status}</p>
                          <p>Subtotal: {formatarValor(item.subtotal)}</p>
                        </div>
  
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
            </div>
          </Card>
        {/each}
  
        {#if pedidosFiltrados.length === 0}
          <div class="text-center text-gray-400 py-8 md:col-span-2">
            Nenhum pedido encontrado.
          </div>
        {/if}
      </div>
    </div>
  {/if}
  
  <!-- Modal de confirmação -->
  <ConfirmModal
    open={confirmOpen}
    message="Tem certeza que deseja excluir este pedido? Essa ação não poderá ser desfeita."
    confirmText="Excluir"
    cancelText="Cancelar"
    onConfirm={handleConfirm}
    onCancel={handleCancel}
  />
  
  <!-- Botão voltar -->
<Button 
class="font-special !flex !items-center text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-lg px-3 py-1.5"
onclick={() => goto('/painel')}
        >
<ArrowLeftOutline class="mr-1.5 h-4 w-4" /> VOLTAR
</Button>

  