<script lang="ts">
	import { Card, Button, Input, Label } from 'flowbite-svelte';
	import { CirclePlusOutline } from 'flowbite-svelte-icons';
	import api from '$lib/api';
	import type { ApiResponse } from '$lib/api';
	import type { EnderecoFormData } from '$lib/models/Endereco';

	// Correção da tipagem do TypeScript que quebrava o compilador
	export let onSalvo: () => void | Promise<void>;

	let submetendo = false;
	let error = '';
	let sucesso = '';

	let form: EnderecoFormData = {
		id: 0,
		cep: 0,
		rua: '',
		numero: 0,
		cidade: '',
		estado: '',
		complemento: ''
	};

	async function cadastrarEndereco(e: Event) {
		e.preventDefault();
		submetendo = true;
		error = '';
		sucesso = '';

		if (!form.cep || !form.rua || !form.numero || !form.cidade || !form.estado) {
			error = 'Por favor, preencha todos os campos obrigatórios.';
			submetendo = false;
			return;
		}

		try {
			const res = await api.post('/enderecos', form);
			const body = res.data as ApiResponse<any>;

			if (body.success) {
				sucesso = 'Endereço cadastrado com sucesso!';
				// Correção do erro de digitação de "city" para "cidade" no reset
				form = { id: 0, cep: 0, rua: '', numero: 0, cidade: '', estado: '', complemento: '' };
				
				if (onSalvo) await onSalvo();
			} else {
				error = body.message || 'Erro ao salvar endereço.';
			}
		} catch (e: any) {
			const body = e.response?.data as ApiResponse<any> | undefined;
			error = body?.message || 'Erro ao cadastrar endereço.';
		} finally {
			submetendo = false;
		}
	}
</script>

<Card class="w-full p-6 bg-neutral-950 border border-neutral-900 rounded-2xl flex flex-col gap-5">
	<span class="font-special text-xs text-neutral-500 tracking-widest uppercase flex items-center gap-1.5">
		<CirclePlusOutline class="h-4 w-4" /> Novo Endereço
	</span>

	{#if error}
		<div class="text-sm text-red-500 font-poppins bg-red-950/30 p-3 rounded-xl border border-red-900/50">{error}</div>
	{/if}
	{#if sucesso}
		<div class="text-sm text-green-500 font-poppins bg-green-950/30 p-3 rounded-xl border border-green-900/50">{sucesso}</div>
	{/if}

	<form onsubmit={cadastrarEndereco} class="flex flex-col gap-4">
		<div class="grid grid-cols-3 gap-4">
			<div class="col-span-2">
				<Label class="text-xs text-neutral-400 uppercase tracking-wider mb-1 block">CEP *</Label>
				<Input type="number" class="bg-neutral-900 border-neutral-800 text-white rounded-xl focus:ring-white focus:border-white" placeholder="00000000" bind:value={form.cep} required />
			</div>
			<div>
				<Label class="text-xs text-neutral-400 uppercase tracking-wider mb-1 block">Número *</Label>
				<Input type="number" class="bg-neutral-900 border-neutral-800 text-white rounded-xl focus:ring-white focus:border-white" placeholder="123" bind:value={form.numero} required />
			</div>
		</div>

		<div>
			<Label class="text-xs text-neutral-400 uppercase tracking-wider mb-1 block">Logradouro / Rua *</Label>
			<Input type="text" class="bg-neutral-900 border-neutral-800 text-white rounded-xl focus:ring-white focus:border-white" placeholder="Nome da rua ou avenida" bind:value={form.rua} required />
		</div>

		<div class="grid grid-cols-3 gap-4">
			<div class="col-span-2">
				<Label class="text-xs text-neutral-400 uppercase tracking-wider mb-1 block">Cidade *</Label>
				<Input type="text" class="bg-neutral-900 border-neutral-800 text-white rounded-xl focus:ring-white focus:border-white" placeholder="Cidade" bind:value={form.cidade} required />
			</div>
			<div>
				<Label class="text-xs text-neutral-400 uppercase tracking-wider mb-1 block">Estado (UF) *</Label>
				<Input type="text" maxlength="2" class="bg-neutral-900 border-neutral-800 text-white rounded-xl focus:ring-white focus:border-white uppercase" placeholder="SP" bind:value={form.estado} required />
			</div>
		</div>

		<div>
			<Label class="text-xs text-neutral-400 uppercase tracking-wider mb-1 block">Complemento</Label>
			<Input type="text" class="bg-neutral-900 border-neutral-800 text-white rounded-xl focus:ring-white focus:border-white" placeholder="Apto, Bloco, Fundos (Opcional)" bind:value={form.complemento} />
		</div>

		<Button type="submit" disabled={submetendo} class="font-special w-full bg-white text-black hover:bg-gray-300 rounded-xl py-2.5 uppercase tracking-wider mt-2">
			{submetendo ? 'Salvando...' : 'Salvar Endereço'}
		</Button>
	</form>
</Card>