
<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import api from '$lib/api';
    import type { ApiResponse } from '$lib/api';
    import type { Pedido } from '$lib/models/Pedido';

    import { Button, Heading } from 'flowbite-svelte';
    import {
        ShoppingBagOutline,
        ArrowLeftOutline
    } from 'flowbite-svelte-icons';

    let pedido: Pedido | null = null;
    let loading = true;
    let error = '';

    async function carregarPedido() {
        try {
            const id = $page.params.id;

            const res = await api.get(`/pedidos/${id}`);
            const body = res.data as ApiResponse<Pedido>;

            if (body.success && body.data) {
                pedido = body.data;
            } else {
                error = body.message || 'Erro ao carregar pedido.';
            }
        } catch (e: any) {
            const body = e.response?.data as ApiResponse<Pedido> | undefined;
            error = body?.message || 'Erro ao carregar pedido.';
        } finally {
            loading = false;
        }
    }

    function formatarValor(valor: number) {
        return (valor / 100).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    function formatarData(data: string) {
        return new Date(data).toLocaleString('pt-BR');
    }

    onMount(carregarPedido);
</script>

<svelte:head>
    <title>Ardoncap - Detalhes do Pedido</title>
</svelte:head>

<div class="min-h-screen w-full bg-black text-white px-4 pt-32 pb-12 md:px-8">
    <div class="max-w-3xl mx-auto flex flex-col gap-8">

        <!-- CABEÇALHO -->
        <div class="pb-4 flex items-center justify-between gap-4">
            <div class="flex items-center gap-3 min-w-0">
                <ShoppingBagOutline class="h-8 w-8 text-white shrink-0" />

                <Heading
                    tag="h2"
                    class="font-instrument text-3xl uppercase tracking-wider text-white"
                >
                    Pedido #{pedido?.id ?? $page.params.id}
                </Heading>
            </div>

            <Button
                class="font-special !flex !items-center text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-lg px-3 py-1.5 shrink-0"
                onclick={() => goto('/profile/pedido')}
            >
                <ArrowLeftOutline class="mr-1.5 h-4 w-4" />
                VOLTAR
            </Button>
        </div>

        {#if loading}

            <p class="text-center py-10 text-neutral-400">
                Carregando pedido...
            </p>

        {:else if error}

            <div class="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
                <p class="text-red-500 text-center">
                    {error}
                </p>
            </div>

        {:else if pedido}

            <!-- INFORMAÇÕES DO PEDIDO -->
            <div class="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 md:p-8">

                <div class="flex flex-col sm:flex-row justify-between gap-4 border-b border-neutral-800 pb-6">

                    <div>
                        <h3 class="font-special text-lg">
                            Informações do pedido
                        </h3>

                        <p class="text-sm text-neutral-400 mt-2">
                            Realizado em {formatarData(pedido.data_pedido)}
                        </p>
                    </div>

                    <span class="text-sm uppercase font-bold text-white self-start">
                        {pedido.status}
                    </span>

                </div>

                <!-- ITENS DO PEDIDO -->
                <section class="py-6">
                    <h3 class="font-special text-lg mb-5">
                        Itens do pedido
                    </h3>

                    {#each pedido.items ?? [] as item}
                        <div class="flex gap-4 py-4 border-neutral-800">
                            {#if item.produto?.imagem}
                            <a href={`/produto/${item.produto.id}`}>
                                <img
                                    src={item.produto.imagem}
                                    alt={item.produto.nome}
                                    class="w-24 h-24 object-cover rounded-lg bg-neutral-900 shrink-0"
                                />
                            </a>
                            {/if}
                            <div class="flex flex-col justify-center flex-1 min-w-0">

                                <h4 class="font-medium truncate">
                                    {item.produto?.nome ?? `Produto #${item.id_produto}`}
                                </h4>

                                <p class="text-sm text-neutral-400">
                                    Vendedor: {item.produto?.vendedor ?? 'Não informado'}
                                </p>                                

                                <p class="text-sm text-neutral-400">
                                    Quantidade: {item.quantidade}
                                </p>

                                <p class="text-sm text-neutral-400">
                                    Valor unitário: {formatarValor(item.preco_unitario)}
                                </p>

                                <p class="text-sm font-semibold mt-2">
                                    Subtotal: {formatarValor(item.subtotal)}
                                </p>
                            </div>
                        </div>
                    {/each}
                </section>

                <!-- ENDEREÇO DE ENTREGA -->
                <section class="py-5 border-b border-neutral-800">
                    <h3 class="font-special text-lg mb-3">
                        Endereço de entrega
                    </h3>

                    <div class="text-sm text-neutral-300 space-y-1">
                        <p>
                            {pedido.rua ?? 'Rua não informada'}
                            {pedido.numero ? `, ${pedido.numero}` : ''}
                        </p>
                </section>

                <!-- TOTAL -->
                <div class="flex justify-between items-center pt-6 gap-4">
                    <span class="text-neutral-400">
                        Total do pedido
                    </span>

                    <span class="text-xl font-bold">
                        {formatarValor(pedido.valor)}
                    </span>
                </div>
            </div>
        {/if}
    </div>
</div>
