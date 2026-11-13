
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
    import { page } from '$app/stores';
    import { Button } from 'flowbite-svelte';

    $: origemPerfil = $page.url.pathname.startsWith('/profilestore')
    ? 'profilestore'
    : 'profile';

    export let id: number | null = null;

    let user: UserFormData | null = null;
    let loading = true;
    let error = '';

    let produtos: Produto[] = [];
    let loadingProdutos = true;
    let erroProdutos = '';

    let usuarioLogadoId: number | null = null;
    let isDonoPerfil = false;

    // Buscar o usuário autenticado
    async function loadUsuarioLogado() {
        try {
            const res = await api.get('/users/me');
            const body = res.data as ApiResponse<User>;

            if (body.success && body.data) {
                usuarioLogadoId = Number(body.data.id);
            }
        } catch (e) {
            usuarioLogadoId = null;
        }
    }

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
    loadUsuarioLogado();
    }

    $: isDonoPerfil =
        usuarioLogadoId !== null &&
        user !== null &&
        usuarioLogadoId === Number(user.id);
        

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


<div class="w-full max-w-6xl mx-auto px-3 sm:px-5 lg:px-8 py-6 md:py-10">

    {#if loading}
        <p class="text-center text-white py-12">
            Carregando perfil...
        </p>

    {:else if error}
        <p class="text-center text-red-500 py-12">
            {error}
        </p>

    {:else if user}

        <div class="w-full bg-white rounded-xl shadow-sm overflow-hidden">

            <!-- CABEÇALHO DO PERFIL -->
            <div class="px-4 py-5 sm:px-6 md:px-8 md:py-7 border-b border-gray-200">

                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

                    <!-- INFORMAÇÕES DO USUÁRIO -->
                    <div class="min-w-0 flex-1">
                        <h1 class="text-xl md:text-2xl font-semibold text-black font-special truncate">
                            {user.login}
                        </h1>

                        <p class="text-sm md:text-base text-gray-400 mt-1 truncate font-special">
                            {user.email}
                        </p>
                    </div>

                    <!-- AÇÕES DO PROPRIETÁRIO -->
                    {#if isDonoPerfil}
                        <div class="flex items-center justify-start sm:justify-end gap-2">

                            <button
                                class="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-black hover:bg-gray-100 transition"
                                title="Meus pedidos"
                                on:click={() => goto('/profile/pedido')}
                            >
                                <ShoppingBagSolid class="h-5 w-5 shrink-0" />
                                <span class="text-xs hidden md:inline">Pedidos</span>
                            </button>

                            <button
                                class="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-black hover:bg-gray-100 transition"
                                title="Meus endereços"
                                on:click={() => goto('/profile/endereco?from=profile')}
                            >
                                <MapPinAltSolid class="h-5 w-5 shrink-0" />
                                <span class="text-xs hidden md:inline">Endereços</span>
                            </button>

                            <button
                                class="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-black hover:bg-gray-100 transition"
                                title="Editar perfil"
                                on:click={() => goto(`/profile/edit/${user.id}`)}
                            >
                                <EditOutline class="h-5 w-5 shrink-0" />
                                <span class="text-xs hidden md:inline">Editar</span>
                            </button>

                        </div>
                    {/if}

                </div>
            </div>

            <!-- ÁREA DE PRODUTOS -->
            <div class="px-4 py-6 sm:px-6 md:px-8 md:py-8">

                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-lg md:text-xl font-semibold text-black font-special">
                        Produtos
                    </h2>

                    <span class="text-xs text-gray-400">
                        {produtos.length} {produtos.length === 1 ? 'produto' : 'produtos'}
                    </span>
                </div>

                {#if loadingProdutos}

                    <p class="text-center text-gray-400 py-12">
                        Carregando produtos...
                    </p>

                {:else if erroProdutos}

                    <p class="text-center text-red-500 py-12">
                        {erroProdutos}
                    </p>

                {:else if produtos.length === 0}

                    <div class="flex flex-col items-center justify-center py-12 text-center">
                        <ShoppingBagSolid class="w-10 h-10 text-gray-300 mb-3" />

                        <p class="text-gray-500 font-medium font-instrument">
                            Sem produtos por aqui
                        </p>

                        <p class="text-sm text-gray-400 mt-1 font-instrument">
                            Este usuário ainda não possui produtos cadastrados.
                        </p>
                    </div>
                {:else}
                    <!-- GRADE RESPONSIVA -->
                    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-7 sm:gap-x-5">

                        {#each produtos as produto}
                            <a
                                href={`/produto/${produto.id}?from=${origemPerfil}${origemPerfil === 'profilestore' ? `&idPerfil=${user.id}` : ''}`}
                                class="group min-w-0"
                            >

                                <!-- IMAGEM -->
                                <div class="aspect-square overflow-hidden rounded-lg bg-gray-100">
                                    <img
                                        src={produto.imagem}
                                        alt={produto.nome}
                                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>

                                <!-- INFORMAÇÕES -->
                                <div class="mt-3">
                                    <p class="text-xs text-gray-400 truncate">
                                        {produto.categoria_nome}
                                    </p>

                                    <h3 class="text-sm text-black font-medium truncate mt-1 group-hover:text-gray-500 transition-colors">
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
            {#if isDonoPerfil}
                <div class="px-4 pb-5 sm:px-6 md:px-8 md:pb-7 flex justify-end">
                    <Button
                        pill={true}
                        color="light"
                        class="!p-3"
                        aria-label="Cadastrar produto"
                        onclick={() => goto('/produtosuser/new')}
                    >
                        <svg
                            class="w-6 h-6 text-gray-800"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke="currentColor"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M5 12h14m-7 7V5"
                            />
                        </svg>
                    </Button>
                </div>
            {/if}
        </div>
        
    {/if}
</div>
