<script lang="ts">
	import { Card, Button, Input, Label, Modal } from 'flowbite-svelte';
	import { TrashBinOutline, EditOutline } from 'flowbite-svelte-icons';
	import api from '\$lib/api';
	import type { ApiResponse } from '\$lib/api';
	import type { Endereco, EnderecoFormData } from '\$lib/models/Endereco';

	export let enderecos: Endereco[] = [];
	export let loading = false;
	// Correção da tipagem do TypeScript que quebrava o compilador
	export let onAtualizarLista: () => void | Promise<void>;

	let modalEdicaoAberta = false;
	let submetendoEdicao = false;
	let erroEdicao = '';
	
	let formEdicao: EnderecoFormData = {
		id: 0,
		cep: 0,
		rua: '',
		numero: 0,
		cidade: '',
		estado: '',
		complemento: ''
	};

	async function removerEndereco(id: number) {
		if (!confirm('Deseja realmente remover este endereço?')) return;

		try {
			const res = await api.delete(`/enderecos/${id}`);
			const body = res.data as ApiResponse<any>;

			if (body.success) {
				if (onAtualizarLista) await onAtualizarLista();
			} else {
				alert(body.message || 'Não foi possível remover o endereço.');
			}
		} catch (e: any) {
			const body = e.response?.data as ApiResponse<any> | undefined;
			alert(body?.message || 'Erro ao remover endereço.');
		}
	}

	function abrirEdicao(endereco: Endereco) {
		formEdicao = {
			id: endereco.id,
			cep: endereco.cep,
			rua: endereco.rua,
			numero: endereco.numero,
			cidade: endereco.cidade,
			estado: endereco.estado,
			complemento: endereco.complemento
		};
		erroEdicao = '';
		modalEdicaoAberta = true;
	}

	async function salvarEdicao(e: Event) {
		e.preventDefault();
		submetendoEdicao = true;
		erroEdicao = '';

		try {
			const res = await api.put(`/enderecos/${formEdicao.id}`, formEdicao);
			const body = res.data as ApiResponse<any>;

			if (body.success) {
				modalEdicaoAberta = false;
				if (onAtualizarLista) await onAtualizarLista();
			} else {
				erroEdicao = body.message || 'Erro ao atualizar endereço.';
			}
		} catch (e: any) {
			const body = e.response?.data as ApiResponse<any> | undefined;
			erroEdicao = body?.message || 'Erro ao comunicar modificações.';
		} finally {
			submetendoEdicao = false;
		}
	}
</script>

<div class="flex flex-col gap-4 w-full">
	<span class="font-special text-xs text-white tracking-widest uppercase">Endereços Cadastrados</span>

	{#if loading}
		<div class="text-center py-12 text-neutral-500 font-poppins animate-pulse">Carregando seus endereços...</div>
	{:else if enderecos.length === 0}
		<div class="border-2 border-dashed border-neutral-900 rounded-2xl p-12 text-center text-neutral-500 font-poppins">
			Você ainda não possui nenhum endereço cadastrado.
		</div>
	{:else}
		<div class="flex flex-col gap-4">
			{#each enderecos as item (item.id)}
				<Card class="w-full p-5 bg-neutral-950 border border-neutral-900 rounded-2xl flex flex-row items-center justify-between gap-4">
					<div class="flex flex-col gap-1 min-w-0">
						<div class="font-special text-sm text-gray-200 uppercase tracking-wide truncate">
							{item.rua}, Nº {item.numero}
						</div>
						<div class="font-poppins text-xs text-neutral-400">
							{#if item.complemento}
								<span class="text-neutral-500 mr-1">({item.complemento})</span>
							{/if}
							{item.cidade} — {item.estado.toUpperCase()}
						</div>
						<div class="font-poppins text-[0.7rem] text-neutral-600 mt-0.5 tracking-wider">
							CEP: {item.cep}
						</div>
					</div>

					<div class="flex items-center gap-1 shrink-0">
						<button 
							class="text-neutral-600 hover:text-white transition-colors p-2" 
							aria-label="Editar endereço"
							onclick={() => abrirEdicao(item)}
						>
							<EditOutline class="h-5 w-5" />
						</button>

						<button 
							class="text-neutral-600 hover:text-red-500 transition-colors p-2" 
							aria-label="Excluir endereço"
							onclick={() => removerEndereco(item.id)}
						>
							<TrashBinOutline class="h-5 w-5" />
						</button>
					</div>
				</Card>
			{/each}
		</div>
	{/if}
</div>

<Modal bind:open={modalEdicaoAberta} size="xs" autoclose={false} class="bg-neutral-950 border border-neutral-900 text-white rounded-2xl">
	<h3 class="text-xl font-medium text-white mb-4 text-left font-special uppercase tracking-wider">
		Editar Endereço
	</h3>

	{#if erroEdicao}
		<div class="text-xs text-red-500 font-poppins bg-red-950/30 p-3 rounded-xl border border-red-900/50 mb-4">{erroEdicao}</div>
	{/if}

	<form onsubmit={salvarEdicao} class="flex flex-col gap-4 text-left">
		<div class="grid grid-cols-3 gap-4">
			<div class="col-span-2">
				<Label class="text-xs text-neutral-400 uppercase tracking-wider mb-1 block">CEP *</Label>
				<Input type="number" class="bg-neutral-900 border-neutral-800 text-white rounded-xl focus:ring-white focus:border-white" bind:value={formEdicao.cep} required />
			</div>
			<div>
				<Label class="text-xs text-neutral-400 uppercase tracking-wider mb-1 block">Número *</Label>
				<Input type="number" class="bg-neutral-900 border-neutral-800 text-white rounded-xl focus:ring-white focus:border-white" bind:value={formEdicao.numero} required />
			</div>
		</div>

		<div>
			<Label class="text-xs text-neutral-400 uppercase tracking-wider mb-1 block">Logradouro / Rua *</Label>
			<Input type="text" class="bg-neutral-900 border-neutral-800 text-white rounded-xl focus:ring-white focus:border-white" bind:value={formEdicao.rua} required />
		</div>

		<div class="grid grid-cols-3 gap-4">
			<div class="col-span-2">
				<Label class="text-xs text-neutral-400 uppercase tracking-wider mb-1 block">Cidade *</Label>
				<Input type="text" class="bg-neutral-900 border-neutral-800 text-white rounded-xl focus:ring-white focus:border-white" bind:value={formEdicao.cidade} required />
			</div>
			<div>
				<Label class="text-xs text-neutral-400 uppercase tracking-wider mb-1 block">Estado (UF) *</Label>
				<Input type="text" maxlength="2" class="bg-neutral-900 border-neutral-800 text-white rounded-xl focus:ring-white focus:border-white uppercase" bind:value={formEdicao.estado} required />
			</div>
		</div>

		<div>
			<Label class="text-xs text-neutral-400 uppercase tracking-wider mb-1 block">Complemento</Label>
			<Input type="text" class="bg-neutral-900 border-neutral-800 text-white rounded-xl focus:ring-white focus:border-white" bind:value={formEdicao.complemento} />
		</div>

		<div class="flex gap-3 mt-2">
			<Button type="button" class="w-full bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800 rounded-xl py-2" onclick={() => modalEdicaoAberta = false}>
				Cancelar
			</Button>
			<Button type="submit" disabled={submetendoEdicao} class="w-full bg-white text-black hover:bg-gray-300 rounded-xl py-2 font-special uppercase tracking-wider">
				{submetendoEdicao ? 'Salvando...' : 'Atualizar'}
			</Button>
		</div>
	</form>
</Modal>
