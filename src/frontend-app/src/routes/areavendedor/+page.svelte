
<script lang="ts">
    import { onMount } from 'svelte';
    import api from '$lib/api';
    import type { ApiResponse } from '$lib/api';

    import { Heading } from 'flowbite-svelte';
    import { ShoppingBagOutline } from 'flowbite-svelte-icons';

    type Status = 'pendente' | 'enviado' | 'entregue' | 'cancelado';
    type Filtro = 'todos' | Status;

    interface ItemVendido {
        id_pedido: number | string;
        data_pedido: string;
        status_pedido: Status;
        valor: number;
        id_comprador: number | string;
        comprador: string;

        rua: string;
        numero: number;
        cidade: string;
        estado: string;
        cep: number | string;
        complemento?: string;

        id_item: number | string;
        quantidade: number;
        preco_unitario: number;
        subtotal: number;
        status_item: Status;

        id_produto: number | string;
        nome_produto: string;
        imagem_produto?: string;
    }

    interface PedidoAgrupado {
        id_pedido: number | string;
        data_pedido: string;
        status_pedido: Status;
        comprador: string;
        rua: string;
        numero: number;
        cidade: string;
        estado: string;
        cep: number | string;
        complemento?: string;
        items: ItemVendido[];
    }

    let pedidos: ItemVendido[] = [];
    let pedidosAgrupados: PedidoAgrupado[] = [];

    let loading = true;
    let error = '';
    let mensagem = '';

    let filtro: Filtro = 'todos';
    let atualizandoId: number | string | null = null;

    const statusLabels: Record<Status, string> = {
        pendente: 'Pendente',
        enviado: 'Enviado',
        entregue: 'Entregue',
        cancelado: 'Cancelado'
    };

    function formatarValor(valor: number) {
        return (valor / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    function formatarData(data: string) {
        return new Date(data).toLocaleString('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short'
        });
    }

    function classeStatus(status: Status) {
        switch (status) {
            case 'pendente':
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'enviado':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'entregue':
                return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'cancelado':
                return 'bg-red-500/10 text-red-400 border-red-500/20';
        }
    }

    function agruparPedidos(itens: ItemVendido[]): PedidoAgrupado[] {
        const grupos = new Map<string, PedidoAgrupado>();

        for (const item of itens) {
            const chave = String(item.id_pedido);

            if (!grupos.has(chave)) {
                grupos.set(chave, {
                    id_pedido: item.id_pedido,
                    data_pedido: item.data_pedido,
                    status_pedido: item.status_pedido,
                    comprador: item.comprador,
                    rua: item.rua,
                    numero: item.numero,
                    cidade: item.cidade,
                    estado: item.estado,
                    cep: item.cep,
                    complemento: item.complemento,
                    items: []
                });
            }

            grupos.get(chave)!.items.push(item);
        }

        return Array.from(grupos.values());
    }

    async function carregarPedidos() {
        try {
            loading = true;
            error = '';

            const res = await api.get('/pedidos/vendedor');
            const body = res.data as ApiResponse<ItemVendido[]>;

            if (body.success && body.data) {
                pedidos = body.data;
                pedidosAgrupados = agruparPedidos(pedidos);
            } else {
                error = body.message || 'Não foi possível carregar os pedidos.';
            }
        } catch (e: any) {
            const body = e.response?.data as ApiResponse<ItemVendido[]> | undefined;
            error = body?.message || 'Erro ao carregar os pedidos.';
        } finally {
            loading = false;
        }
    }

    async function atualizarStatus(item: ItemVendido, novoStatus: Status) {
        if (atualizandoId !== null) return;

        if (novoStatus === 'cancelado') {
            const confirmar = window.confirm(
                `Deseja realmente cancelar "${item.nome_produto}"? A quantidade será devolvida ao estoque.`
            );

            if (!confirmar) return;
        }

        try {
            atualizandoId = item.id_item;
            mensagem = '';
            error = '';

            const res = await api.put(
                `/pedidos/vendedor/item/${item.id_item}`,
                { status: novoStatus }
            );

            const body = res.data as ApiResponse;

            if (!body.success) {
                error = body.message || 'Não foi possível atualizar o item.';
                return;
            }

            mensagem = `Item "${item.nome_produto}" atualizado para ${statusLabels[novoStatus].toLowerCase()}.`;

            await carregarPedidos();

        } catch (e: any) {
            const body = e.response?.data as ApiResponse | undefined;
            error = body?.message || 'Erro ao atualizar o status do item.';
        } finally {
            atualizandoId = null;
        }
    }

    function totalDosItens(items: ItemVendido[]) {
        return items.reduce((total, item) => total + item.subtotal, 0);
    }

    $: pedidosExibidos = filtro === 'todos'
        ? pedidosAgrupados
        : pedidosAgrupados.filter(pedido =>
            pedido.items.some(item => item.status_item === filtro)
        );

    onMount(carregarPedidos);
</script>

<svelte:head>
    <title>Ardoncap - Pedidos recebidos</title>
    <meta
        name="description"
        content="Gerencie os pedidos realizados nos seus produtos."
    />
</svelte:head>

<div class="min-h-screen w-full bg-black text-white px-4 pt-32 pb-12 md:px-8">

    <div class="max-w-5xl mx-auto flex flex-col gap-8">

        <!-- CABEÇALHO -->
        <div class="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div class="flex items-center gap-3">
                <ShoppingBagOutline class="h-8 w-8 text-white shrink-0" />

                <div>
                    <Heading
                        tag="h2"
                        class="font-instrument text-3xl uppercase tracking-wider text-white"
                    >
                        Pedidos recebidos
                    </Heading>
                </div>
            </div>

        </div>

        <!-- MENSAGENS -->
        {#if mensagem}
            <div class="p-3 rounded-lg border border-green-500/20
                        bg-green-500/10 text-green-400 text-sm">
                {mensagem}
            </div>
        {/if}

        {#if error}
            <div class="p-3 rounded-lg border border-red-500/20
                        bg-red-500/10 text-red-400 text-sm">
                {error}
            </div>
        {/if}
        <!-- FILTROS -->
        <div class="flex flex-wrap gap-2">

            {#each [
                { valor: 'todos', label: 'Todos' },
                { valor: 'pendente', label: 'Pendentes' },
                { valor: 'enviado', label: 'Enviados' },
                { valor: 'entregue', label: 'Entregues' },
                { valor: 'cancelado', label: 'Cancelados' }
            ] as opcao}

                <button
                    onclick={() => filtro = opcao.valor as Filtro}
                    class={`rounded-none border px-4 py-2 font-special text-xs tracking-[0.15em] transition-colors
                        ${filtro === opcao.valor
                            ? 'border-white bg-white text-black'
                            : 'border-neutral-700 bg-neutral-950 text-neutral-400 hover:border-white hover:bg-neutral-900 hover:text-white'
                        }`}
                >
                    {opcao.label}
                </button>

            {/each}

        </div>

        <!-- CONTEÚDO -->
        {#if loading}

            <div class="text-center py-20 text-neutral-400">
                Carregando pedidos...
            </div>

        {:else if pedidosExibidos.length === 0}

            <div class="bg-neutral-950 border border-neutral-800 rounded-2xl
                        text-center py-16 px-4">

                <div class="flex justify-center mb-4">
                    <ShoppingBagOutline class="h-10 w-10 text-neutral-600" />
                </div>

                <h2 class="text-lg font-special">
                    Nenhum pedido encontrado
                </h2>

                <p class="text-sm text-neutral-500 mt-2">
                    {filtro === 'todos'
                        ? 'Quando alguém comprar seus produtos, os pedidos aparecerão aqui.'
                        : 'Não existem itens com esse status no momento.'
                    }
                </p>

            </div>

        {:else}

            <div class="flex flex-col gap-6">

                {#each pedidosExibidos as pedido (pedido.id_pedido)}

                    <article class="bg-neutral-950 border border-neutral-800
                                    rounded-2xl overflow-hidden">

                        <!-- INFORMAÇÕES DO PEDIDO -->
                        <div class="p-5 md:p-6 border-b border-neutral-800">

                            <div class="flex flex-col sm:flex-row
                                        sm:justify-between sm:items-start gap-4">

                                <div>
                                    <h2 class="text-xl font-special">
                                        Pedido #{pedido.id_pedido}
                                    </h2>

                                    <p class="text-sm text-neutral-400 mt-2">
                                        Realizado em {formatarData(pedido.data_pedido)}
                                    </p>

                                    <p class="text-sm text-neutral-400 mt-1">
                                        Comprador:
                                        <span class="text-white">
                                            {pedido.comprador}
                                        </span>
                                    </p>
                                </div>

                                <div class="flex flex-col sm:items-end gap-2">

                                    <span class={`text-xs px-3 py-1 rounded-full border
                                        ${classeStatus(pedido.status_pedido)}`}>
                                        Situação: {statusLabels[pedido.status_pedido]}
                                    </span>

                                    <span class="text-sm text-neutral-400">
                                        Seus itens:
                                        <strong class="text-white">
                                            {formatarValor(totalDosItens(pedido.items))}
                                        </strong>
                                    </span>

                                </div>

                            </div>

                        </div>

                        <!-- ITENS DO PEDIDO -->
                        <div class="p-5 md:p-6">

                            <h3 class="font-special text-lg mb-5">
                                Produtos deste pedido
                            </h3>

                            <div class="flex flex-col">

                                {#each pedido.items as item, i (item.id_item)}

                                    <div class="flex flex-col md:flex-row gap-4
                                                md:items-center py-5
                                                {i !== pedido.items.length - 1 ? 'border-b border-neutral-800' : ''}">

                                        <!-- PRODUTO -->
                                        <div class="flex gap-4 flex-1 min-w-0">

                                            {#if item.imagem_produto}
                                                <img
                                                    src={item.imagem_produto}
                                                    alt={item.nome_produto}
                                                    class="w-24 h-24 object-cover rounded-xl
                                                           bg-neutral-900 border border-neutral-800 shrink-0"
                                                />
                                            {:else}
                                                <div class="w-24 h-24 rounded-xl bg-neutral-900
                                                            border border-neutral-800 flex
                                                            items-center justify-center
                                                            text-neutral-600 text-xs shrink-0">
                                                    Sem imagem
                                                </div>
                                            {/if}

                                            <div class="flex flex-col justify-center min-w-0">

                                                <h4 class="font-medium truncate">
                                                    {item.nome_produto}
                                                </h4>

                                                <p class="text-sm text-neutral-400 mt-1">
                                                    Quantidade: {item.quantidade}
                                                </p>

                                                <p class="text-sm text-neutral-400">
                                                    Valor unitário:
                                                    {formatarValor(item.preco_unitario)}
                                                </p>

                                                <p class="text-sm font-semibold mt-2">
                                                    Subtotal:
                                                    {formatarValor(item.subtotal)}
                                                </p>

                                            </div>

                                        </div>

                                        <!-- STATUS E AÇÕES -->
                                        <div class="flex flex-col gap-3 md:items-end md:min-w-48">

                                            <span class={`text-xs px-3 py-1 rounded-full
                                                           border w-fit
                                                           ${classeStatus(item.status_item)}`}>
                                                {statusLabels[item.status_item]}
                                            </span>

                                            {#if item.status_item === 'pendente'}

                                                <div class="flex flex-wrap gap-2">

                                                    <button
                                                        onclick={() => atualizarStatus(item, 'enviado')}
                                                        disabled={atualizandoId !== null}
                                                        class="px-3 py-2 rounded-lg bg-neutral-100
                                                               hover:bg-white text-black text-xs
                                                               font-medium transition disabled:opacity-50"
                                                    >
                                                        Marcar como enviado
                                                    </button>

                                                    <button
                                                        onclick={() => atualizarStatus(item, 'cancelado')}
                                                        disabled={atualizandoId !== null}
                                                        class="px-3 py-2 rounded-lg border
                                                               border-red-500/30 text-red-400
                                                               hover:bg-red-500/10 text-xs
                                                               transition disabled:opacity-50"
                                                    >
                                                        Cancelar item
                                                    </button>

                                                </div>

                                            {:else if item.status_item === 'enviado'}

                                                <button
                                                    onclick={() => atualizarStatus(item, 'entregue')}
                                                    disabled={atualizandoId !== null}
                                                    class="px-3 py-2 rounded-lg bg-neutral-100
                                                           hover:bg-white text-black text-xs
                                                           font-medium transition disabled:opacity-50"
                                                >
                                                    Marcar como entregue
                                                </button>

                                            {:else if item.status_item === 'entregue'}

                                                <span class="text-xs text-green-400">
                                                    Item finalizado
                                                </span>

                                            {:else if item.status_item === 'cancelado'}

                                                <span class="text-xs text-red-400">
                                                    Item cancelado
                                                </span>

                                            {/if}

                                            {#if atualizandoId === item.id_item}
                                                <span class="text-xs text-neutral-500">
                                                    Atualizando...
                                                </span>
                                            {/if}

                                        </div>

                                    </div>

                                {/each}

                            </div>

                        </div>

                        <!-- ENDEREÇO DE ENTREGA -->
                        <div class="px-5 md:px-6 py-5 border-t border-neutral-800
                                    bg-neutral-900/30">

                            <h3 class="font-special text-lg mb-3">
                                Endereço de entrega
                            </h3>

                            <div class="text-sm text-neutral-400 space-y-1">

                                <p>
                                    {pedido.rua}, {pedido.numero}
                                    {#if pedido.complemento}
                                        - {pedido.complemento}
                                    {/if}
                                </p>

                                <p>
                                    {pedido.cidade} - {pedido.estado}
                                </p>

                                <p>
                                    CEP: {pedido.cep}
                                </p>

                            </div>

                        </div>

                    </article>

                {/each}

            </div>

        {/if}

    </div>

</div>
