<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, Heading } from 'flowbite-svelte';
	import { ArrowLeftOutline, MapPinOutline } from 'flowbite-svelte-icons';
	import api from '$lib/api';
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

	onMount(async () => {
		await carregarEnderecos();
	});
</script>

<svelte:head>
	<title>Ardoncap - Meus Endereços</title>
</svelte:head>

<div class="min-h-screen w-full bg-black text-white px-4 pt-32 pb-12 md:px-8">
	<div class="max-w-5xl mx-auto flex flex-col gap-10">
		
		<!-- Cabeçalho Principal -->
		<div class="pb-4 flex items-center gap-3">
			<Heading tag="h2" class="font-instrument text-white text-3xl uppercase tracking-wider">Gerenciar Endereços</Heading>
		</div>

		{#if error}
			<div class="text-sm text-red-500 font-poppins bg-red-950/30 p-3 rounded-xl border border-red-900/50">
				{error}
			</div>
		{/if}

		<div class="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">
			
			<!-- Coluna do Formulário (Ocupa 2 colunas no desktop) -->
			<div class="lg:col-span-2">
				<!-- Passamos a função carregarEnderecos para atualizar a lista ao salvar -->
				<FormEndereco onSalvo={carregarEnderecos} />
			</div>

			<!-- Coluna da Listagem (Ocupa 3 colunas no desktop) -->
			<div class="lg:col-span-3">
				<!-- Passamos os dados da lista e a função de atualização para o CRUD interno -->
				<ListaEnderecos 
					{enderecos} 
					{loading} 
					onAtualizarLista={carregarEnderecos} 
				/>
			</div>
			<Button 
				class="font-special !flex !items-center text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-lg px-3 py-1.5"
				onclick={() => goto('/profile')}
			>
				<ArrowLeftOutline class="mr-1.5 h-4 w-4" /> VOLTAR
			</Button>

		</div>
	</div>
</div>
