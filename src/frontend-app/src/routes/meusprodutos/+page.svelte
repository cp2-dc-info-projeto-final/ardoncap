<script lang="ts">
    import { onMount } from 'svelte';
    import { Card, Badge } from 'flowbite-svelte';
    import { ShoppingBagOutline, ArrowRightOutline, ChevronDownOutline, ChevronUpOutline } from 'flowbite-svelte-icons';
    import { goto } from '$app/navigation';
    import api from '$lib/api';
    import type { ApiResponse } from '$lib/api';
  
    // Interface para espelhar os itens agregados do banco de dados (item_pedido JOIN produto)
    interface ProdutoVendido {
      item_id: number;
      produto_id: number;
      nome: string;
      imagem: string;
      quantidade: number;
      preco_unitario: number;
      subtotal: number;
    }
  
    // Interface principal mapeada conforme o seu esquema de tabelas (pedido + comprador + endereco)
    interface PedidoVendedor {
      pedido_id: number;
      data_pedido: string;
      status: string;
      pedido_valor_total: number;
      comprador_nome: string;
      comprador_email: string;
      endereco_rua: string;
      endereco_numero: number;
      endereco_cidade: string;
      endereco_estado: string;
      produtos: ProdutoVendido[];
    }
  
    // Runes do Svelte 5 para gerenciamento de estado reativo
    let pedidos = $state<PedidoVendedor[]>([]);
    let loading = $state(true);
    let error = $state('');
    
    // Dicionário reativo para controlar quais painéis de produtos estão expandidos
    let pedidosExpandidos = $state<Record<number, boolean>>({});
  
    async function carregarPedidosVendedor() {
      try {
        const res = await api.get('/vendedor/pedidos');
        const body = res.data as ApiResponse<PedidoVendedor[]>;
        if (body.success) {
          pedidos = body.data ?? [];
        } else {
          error = body.message || 'Erro ao carregar os pedidos dos clientes.';
        }
      } catch (e: any) {
        const body = e.response?.data as ApiResponse<PedidoVendedor[]> | undefined;
        error = body?.message || 'Erro ao conectar com o servidor.';
      } finally {
        loading = false;
      }
    }
  
    function toggleProdutos(id: number) {
      pedidosExpandidos[id] = !pedidosExpandidos[id];
    }
  
    function getStatusCor(status: string) {
      switch (status.toLowerCase()) {
        case 'pago': return 'green';
        case 'entregue': return 'blue';
        case 'cancelado': return 'red';
        default: return 'yellow';
      }
    }
  
    function formatarMoeda(centavos: number) {
      return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
  
    function formatarData(dataSql: string) {
      return new Date(dataSql).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  
    onMount(async () => {
      await carregarPedidosVendedor();
    });
  </script>
  
  <div class="w-full flex flex-col gap-4 text-left">
    <span class="font-special text-xs text-neutral-500 tracking-widest uppercase flex items-center gap-1.5">
      <ShoppingBagOutline class="h-4 w-4" /> Painel de Vendas — Pedidos Recebidos
    </span>
  
    {#if loading}
      <div class="text-center py-8 text-neutral-500 font-poppins animate-pulse">Carregando pedidos dos clientes...</div>
    {:else if error}
      <div class="text-sm text-red-500 font-poppins bg-red-950/30 p-3 rounded-xl border border-red-900/50">{error}</div>
    {:else if pedidos.length === 0}
      <div class="border-2 border-dashed border-neutral-900 rounded-2xl p-10 text-center text-neutral-500 font-poppins">
        Nenhum cliente realizou compras dos seus produtos ainda.
      </div>
    {:else}
      <div class="flex flex-col gap-3">
        {#each pedidos as pedido (pedido.pedido_id)}
          <Card class="w-full p-4 bg-neutral-950 border border-neutral-900 rounded-2xl flex flex-col gap-4">
            
            <!-- Linha Superior / Cabeçalho do Card -->
            <div class="flex flex-row items-start justify-between gap-4 w-full">
              <div class="flex flex-col gap-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-special text-sm text-white">PEDIDO #{pedido.pedido_id}</span>
                  <Badge color={getStatusCor(pedido.status)} class="uppercase text-[0.6rem] font-bold tracking-wider px-2 py-0.5 rounded">
                    {pedido.status}
                  </Badge>
                </div>
                
                <div class="font-poppins text-xs font-medium text-neutral-300 mt-0.5">
                  Cliente: <span class="text-white">{pedido.comprador_nome}</span> 
                  <span class="text-neutral-500 text-[0.7rem] block md:inline md:ml-1">({pedido.comprador_email})</span>
                </div>
  
                <div class="font-poppins text-xs text-neutral-400">
                  Data: {formatarData(pedido.data_pedido)} — 
                  <span class="font-semibold text-white">
                    Total Recebido: {formatarMoeda(pedido.pedido_valor_total)}
                  </span>
                </div>
              </div>
  
              <!-- Ações Laterais Direitas -->
              <div class="flex items-center gap-1 shrink-0">
                <!-- Botão para Expandir/Recolher Detalhes dos Produtos -->
                <button 
                  class="text-neutral-500 hover:text-white transition-colors p-2 flex items-center gap-1 text-xs font-poppins"
                  onclick={() => toggleProdutos(pedido.pedido_id)}
                  aria-label="Ver produtos do pedido"
                >
                  <span class="hidden sm:inline">{pedido.produtos.length} {pedido.produtos.length === 1 ? 'item' : 'itens'}</span>
                  {#if pedidosExpandidos[pedido.pedido_id]}
                    <ChevronUpOutline class="h-4 w-4" />
                  {:else}
                    <ChevronDownOutline class="h-4 w-4" />
                  {/if}
                </button>
  
                <!-- Botão de redirecionamento para gerenciar a rota completa da venda -->
                <button 
                  class="text-neutral-500 hover:text-white transition-colors p-2"
                  aria-label="Gerenciar pedido"
                  onclick={() => goto(`/dashboard/vendas/${pedido.pedido_id}`)}
                >
                  <ArrowRightOutline class="h-5 w-5" />
                </button>
              </div>
            </div>
  
            <!-- Gaveta de Produtos Desbatida (Exibida dinamicamente) -->
            {#if pedidosExpandidos[pedido.pedido_id]}
              <div class="border-t border-neutral-900 pt-3 flex flex-col gap-2.5 antialiased">
                <span class="text-[0.65rem] font-special uppercase tracking-widest text-neutral-500 block">
                  Seus produtos comprados nesta ordem:
                </span>
                
                <div class="flex flex-col gap-2">
                  {#each pedido.produtos as produto (produto.item_id)}
                    <div class="flex items-center justify-between gap-4 bg-neutral-900/30 border border-neutral-900 p-2.5 rounded-xl">
                      <div class="flex items-center gap-3 min-w-0">
                        <img 
                          src={produto.imagem} 
                          alt={produto.nome} 
                          class="w-10 h-10 object-cover rounded-lg border border-neutral-800 bg-neutral-900 shrink-0" 
                        />
                        <div class="flex flex-col min-w-0">
                          <span class="text-xs font-medium text-white truncate font-poppins">{produto.nome}</span>
                          <span class="text-[0.7rem] text-neutral-500 font-poppins">
                            Qtd: {produto.quantidade} × {formatarMoeda(produto.preco_unitario)}
                          </span>
                        </div>
                      </div>
                      <div class="text-xs font-semibold text-neutral-300 font-poppins shrink-0">
                        {formatarMoeda(produto.subtotal)}
                      </div>
                    </div>
                  {/each}
                </div>
  
                <!-- Detalhes do Endereço de Entrega vinculados à tabela endereco -->
                {#if pedido.endereco_rua}
                  <div class="text-[0.7rem] font-poppins text-neutral-400 bg-neutral-900/15 border border-neutral-900/50 p-2.5 rounded-xl flex flex-col gap-0.5">
                    <span class="font-special text-[0.6rem] uppercase tracking-wider text-neutral-500 block">Endereço para Envio</span>
                    <p class="text-neutral-300">{pedido.endereco_rua}, {pedido.endereco_numero}</p>
                    <p class="text-neutral-500 text-[0.65rem]">{pedido.endereco_cidade} — {pedido.endereco_estado}</p>
                  </div>
                {/if}
              </div>
            {/if}
  
          </Card>
        {/each}
      </div>
    {/if}
  </div>
  