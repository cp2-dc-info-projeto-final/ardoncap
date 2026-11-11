
<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import api from '$lib/api';
    import type { ApiResponse } from '$lib/api';
    import type { Pedido } from '$lib/models/Pedido';

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

<div class="w-full max-w-5xl mx-auto px-4 py-8 text-white">

    <button
        class="text-sm text-neutral-400 hover:text-white mb-6"
        onclick={() => goto('/profile/pedido')}
    >
        ← Voltar aos pedidos
    </button>

    {#if loading}
        <p class="text-center py-10 text-neutral-400">
            Carregando pedido...
        </p>

    {:else if error}
        <p class="text-red-500 text-center py-10">{error}</p>

    {:else if pedido}

        <div class="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 md:p-8">

            <!-- CABEÇALHO -->
            <div class="flex flex-col sm:flex-row justify-between gap-4 border-b border-neutral-800 pb-6">

                <div>
                    <h1 class="text-2xl font-special">
                        Pedido #{pedido.id}
                    </h1>

                    <p class="text-sm text-neutral-400 mt-2">
                        Realizado em {formatarData(pedido.data_pedido)}
                    </p>
                </div>

                <span class="text-sm uppercase font-bold text-white">
                    {pedido.status}
                </span>

            </div>

            <!-- ITENS DO PEDIDO -->
            <section class="py-6">
                <h2 class="text-lg font-special mb-5">
                    Itens do pedido
                </h2>

                {#each pedido.items ?? [] as item}
                    <div class="flex gap-4 py-4 border-b border-neutral-800">

                        {#if item.produto?.imagem}
                            <img
                                src={item.produto.imagem}
                                alt={item.produto.nome}
                                class="w-24 h-24 object-cover rounded-lg bg-neutral-900"
                            />
                        {/if}

                        <div class="flex flex-col justify-center flex-1 min-w-0">

                            <h3 class="font-medium truncate">
                                {item.produto?.nome ?? `Produto #${item.id_produto}`}
                            </h3>

                            <p class="text-sm text-neutral-400 mt-1">
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

            <!-- ENDEREÇO -->
            <section class="py-5 border-b border-neutral-800">
                <h2 class="text-lg font-special mb-3">
                    Endereço de entrega
                </h2>

                <p class="text-sm text-neutral-300">
                    {pedido.endereco?.rua ?? ''}
                    {pedido.endereco?.numero ? `, ${pedido.endereco.numero}` : ''}
                </p>
            </section>

            <!-- TOTAL -->
            <div class="flex justify-between items-center pt-6">
                <span class="text-neutral-400">Total do pedido</span>

                <span class="text-xl font-bold">
                    {formatarValor(pedido.valor)}
                </span>
            </div>

        </div>

    {/if}

</div>
