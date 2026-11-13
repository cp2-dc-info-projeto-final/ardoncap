<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, Heading } from 'flowbite-svelte';
	import { ArrowLeftOutline, MapPinOutline } from 'flowbite-svelte-icons';
	import api from '$lib/api';
	import { page } from '$app/stores';
	import type { ApiResponse } from '$lib/api';
	import type { Endereco } from '$lib/models/Endereco';

	// Importação dos componentes isolados
	import FormEndereco from '../../../components/FormEndereco.svelte'; // Ajuste o caminho se necessário
	import ListaEnderecos from '../../../components/ListaEnderecos.svelte'; // Ajuste o caminho se necessário
	import { goto } from '$app/navigation';

	let enderecos: Endereco[] = [];
	let loading = true;
	let error = '';

	// Função centralizada para carregar/atualizar os dados do banco
	async function carregarEnderecos() {
		try {
			const res = await api.get('/enderecos');
			const body = res.data as ApiResponse<Endereco[]>;
			if (body.success) {
				enderecos = body.data ?? [];
			} else {
				error = body.message || 'Erro ao carregar endereços.';
			}
		} catch (e: any) {
			const body = e.response?.data as ApiResponse<Endereco[]> | undefined;
			error = body?.message || 'Erro ao comunicar com o servidor.';
		} finally {
			loading = false;
		}
	}

	function handleBack() {
    const origem = $page.url.searchParams.get('from');

    if (origem === 'profile') {
        goto('/profile');
    } else if (origem === 'carrinho') {
        goto('/carrinho');
    } else {
        goto('/');
    }
}

	onMount(async () => {
		await carregarEnderecos();
	});
</script>


<svelte:head>
    <title>Ardoncap - Meus Endereços</title>
</svelte:head>

<div class="min-h-screen w-full bg-black text-white px-3 sm:px-5 md:px-6 lg:px-8 pt-28 md:pt-32 pb-12">

    <div class="w-full max-w-7xl mx-auto flex flex-col gap-6 md:gap-8">

        <!-- Cabeçalho Principal -->
        <div class="pb-3 flex items-center justify-center sm:justify-start">
            <Heading tag="h2" class="font-instrument text-white text-2xl md:text-3xl uppercase tracking-wider">
                Gerenciar Endereços
            </Heading>
        </div>

        {#if error}
            <div class="text-sm text-red-500 font-poppins bg-red-950/30 p-3 rounded-xl border border-red-900/50">
                {error}
            </div>
        {/if}

        <!-- Conteúdo Principal -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-5 md:gap-6 lg:gap-8 items-start w-full">

            <!-- Formulário -->
            <div class="md:col-span-2 w-full min-w-0">
                <FormEndereco onSalvo={carregarEnderecos} />
            </div>

            <!-- Listagem -->
            <div class="md:col-span-3 w-full min-w-0 max-w-full box-border">
                <ListaEnderecos
                    {enderecos}
                    {loading}
                    onAtualizarLista={carregarEnderecos}
                />
            </div>

            <!-- Botão Voltar -->
            <div class="md:col-span-5 flex justify-center sm:justify-start w-full">
                <Button
                    class="font-special !flex !items-center justify-center text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-lg px-4 py-2"
                    onclick={handleBack}
                >
                    <ArrowLeftOutline class="mr-1.5 h-4 w-4" />
                    VOLTAR
                </Button>
            </div>

        </div>
    </div>
</div>
