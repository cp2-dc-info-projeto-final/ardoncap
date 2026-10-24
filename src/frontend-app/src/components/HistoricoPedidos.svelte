<script lang="ts">
  import { onMount } from 'svelte';
  import { Card, Badge } from 'flowbite-svelte';
  import { ShoppingBagOutline, ArrowRightOutline } from 'flowbite-svelte-icons';
  import { goto } from '\$app/navigation';
  import api from '\$lib/api';
  import type { ApiResponse } from '\$lib/api';
  import type { Pedido } from '\$lib/models/Pedido';

  // Interface local estendida para silenciar os avisos do VS Code sobre o JOIN do banco de dados
  interface PedidoComEndereco extends Pedido {
    endereco_rua?: string;
    endereco_numero?: number;
  }

  // Tipamos o array explicitamente com a nossa interface local
  let pedidos: PedidoComEndereco[] = [];
  let loading = true;
  let error = '';

  async function carregarHistorico() {
    try {
      const res = await api.get('/pedidos');
      const body = res.data as ApiResponse<PedidoComEndereco[]>;
      if (body.success) {
        pedidos = body.data ?? [];
      } else {
        error = body.message || 'Erro ao carregar o histórico de pedidos.';
      }
    } catch (e: any) {
      const body = e.response?.data as ApiResponse<PedidoComEndereco[]> | undefined;
      error = body?.message || 'Erro ao conectar com o servidor.';
    } finally {
      loading = false;
    }
  }

  function getStatusCor(status: string) {
    switch (status.toLowerCase()) {
      case 'pago': return 'green';
      case 'entregue': return 'blue';
      case 'cancelado': return 'red';
      default: return 'yellow'; // 'pendente' ou 'enviado'
    }
  }

  function formatarData(dataSql: string) {
    return new Date(dataSql).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  onMount(async () => {
    await carregarHistorico();
  });
</script>

<div class="w-full flex flex-col gap-4 text-left">
  <span class="font-special text-xs text-neutral-500 tracking-widest uppercase flex items-center gap-1.5">
    <ShoppingBagOutline class="h-4 w-4" /> Histórico de Compras
  </span>

  {#if loading}
    <div class="text-center py-8 text-neutral-500 font-poppins animate-pulse">Carregando seus pedidos...</div>
  {:else if error}
    <div class="text-sm text-red-500 font-poppins bg-red-950/30 p-3 rounded-xl border border-red-900/50">{error}</div>
  {:else if pedidos.length === 0}
    <div class="border-2 border-dashed border-neutral-900 rounded-2xl p-10 text-center text-neutral-500 font-poppins">
      Você ainda não realizou nenhuma compra.
    </div>
  {:else}
    <div class="flex flex-col gap-3">
      {#each pedidos as pedido (pedido.id)}
        <Card class="w-full p-4 bg-neutral-950 border border-neutral-900 rounded-2xl flex flex-row items-center justify-between gap-4">
          <div class="flex flex-col gap-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-special text-sm text-white">PEDIDO #{pedido.id}</span>
              <Badge color={getStatusCor(pedido.status)} class="uppercase text-[0.6rem] font-bold tracking-wider px-2 py-0.5 rounded">
                {pedido.status}
              </Badge>
            </div>
            
            <div class="font-poppins text-xs text-neutral-400 mt-1">
              Data: {formatarData(pedido.data_pedido)} — 
              <span class="font-semibold text-white">
                {(pedido.valor / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            
            {#if pedido.endereco_rua}
              <div class="font-poppins text-[0.65rem] text-neutral-500 truncate max-w-xs md:max-w-md">
                Entrega em: {pedido.endereco_rua}, {pedido.endereco_numero}
              </div>
            {/if}
          </div>

          <!-- Evento atualizado para onclick em conformidade com o Svelte 5 -->
          <button 
            class="text-neutral-500 hover:text-white transition-colors p-2 shrink-0"
            aria-label="Ver detalhes do pedido"
            onclick={() => goto(`/profile/pedido/${pedido.id}`)}
          >
            <ArrowRightOutline class="h-5 w-5" />
          </button>
        </Card>
      {/each}
    </div>
  {/if}
</div>