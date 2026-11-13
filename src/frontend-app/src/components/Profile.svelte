
<script lang="ts">
    import { onMount } from 'svelte';
    import api from '$lib/api';
    import type { ApiFieldError, ApiResponse } from '$lib/api';
    import type { User, UserFormData } from '$lib/models/User';
    import {
        BookOpenOutline,
        EditOutline,
        ShoppingBagSolid,
        MapPinAltSolid
    } from 'flowbite-svelte-icons';
    import { goto } from '$app/navigation';
    import type { Produto } from '$lib/models/Produto';

    export let id: number | null = null;

    let user: UserFormData | null = null;
    let loading = true;
    let error = '';

    let produtos: Produto[] = [];
    let loadingProdutos = true;
    let erroProdutos = '';

    // Função para buscar o usuário
    async function loadUser(userId: number | null) {
        if (!userId) return;

        loading = true;
        error = '';

        try {
            const res = await api.get(`/users/public/${userId}`);
            const body = res.data as ApiResponse<User>;

            if (body.success && body.data) {
                user = { ...body.data, senha: '' };
            } else {
                error = body.message || 'Erro ao carregar usuário.';
            }
        } catch (e: any) {
            const body = e.response?.data as ApiResponse<User> | undefined;
            error = body?.message || 'Erro ao carregar usuário.';
        } finally {
            loading = false;
        }
    }

    let ultimoId: number | null = null;

    $: if (id && id !== ultimoId) {
        ultimoId = id;
        loadUser(id);
        loadProdutos(id);
    }

    // Buscar produtos do usuário
    async function loadProdutos(userId: number | null) {
        if (!userId) {
            loadingProdutos = false;
            return;
        }

        loadingProdutos = true;
        erroProdutos = '';

        try {
            const res = await api.get(`/produtos/usuario/${userId}`);
            const body = res.data as ApiResponse<Produto[]>;

            if (body.success) {
                produtos = body.data ?? [];
            } else {
                erroProdutos = body.message || 'Erro ao carregar produtos.';
            }
        } catch (e: any) {
            const body = e.response?.data as ApiResponse<Produto[]> | undefined;
            erroProdutos = body?.message || 'Erro ao carregar produtos.';
        } finally {
            loadingProdutos = false;
        }
    }
</script>

<div class="w-full max-w-5xl mx-auto px-4 md:px-8 py-8">

    {#if loading}
        <p class="text-center text-white py-8">
            Carregando perfil...
        </p>

    {:else if error}
        <p class="text-center text-red-500 py-8">
            {error}
        </p>

    {:else if user}

        <div class="w-full rounded-xl bg-white px-3 pt-3 pb-5 md:px-5 md:pt-4 md:pb-8">

            <!-- CABEÇALHO -->
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-gray-200 pb-5">

                <div class="flex flex-col min-w-0 flex-1">
                    <span class="truncate text-lg font-light font-special text-black">
                        {user.login}
                    </span>

                    <span class="truncate text-sm font-light font-special text-gray-400">
                        {user.email}
                    </span>
                </div>

                <div class="flex items-center gap-1">

                    <button
                        class="flex items-center px-1 py-2 text-black hover:text-gray-400 transition-colors"
                        on:click={() => goto('/profile/pedido')}
                    >
                        <ShoppingBagSolid class="shrink-0 h-6 w-6" />
                    </button>

                    <button
                        class="flex items-center px-1 py-2 text-black hover:text-gray-400 transition-colors"
                        on:click={() => goto('/profile/endereco?from=profile')}
                    >
                        <MapPinAltSolid class="shrink-0 h-7 w-7" />
                    </button>

                    <button
                        class="flex items-center px-1 py-2 text-black hover:text-gray-400 transition-colors"
                        on:click={() => goto(`/profile/edit/${user.id}`)}
                    >
                        <EditOutline class="shrink-0 h-7 w-7" />
                    </button>

                </div>
            </div>

            <!-- PRODUTOS DO USUÁRIO -->
            <div class="pt-6">

                {#if loadingProdutos}
                    <p>Carregando produtos...</p>

                {:else if erroProdutos}
                    <p>{erroProdutos}</p>

                {:else if produtos.length === 0}
                    <p>Sem produtos aqui</p>

                {:else}
                    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">

                        {#each produtos as produto}
                            <a
                                href={`/produto/${produto.id}?from=profile`}
                                class="group min-w-0"
                            >
                                <div class="aspect-square overflow-hidden rounded-lg bg-gray-100">
                                    <img
                                        src={produto.imagem}
                                        alt={produto.nome}
                                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>

                                <div class="mt-3">
                                    <p class="text-xs text-gray-400">
                                        {produto.categoria_nome}
                                    </p>

                                    <h3 class="text-sm text-black font-medium truncate mt-1">
                                        {produto.nome}
                                    </h3>

                                    {#if produto.preco !== null && produto.preco !== undefined}
                                        <p class="text-sm font-semibold text-black mt-2">
                                            {Number(produto.preco).toLocaleString('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL'
                                            })}
                                        </p>
                                    {/if}
                                </div>
                            </a>
                        {/each}
                    </div>
                {/if}
            </div>
        </div>
    {/if}
</div>