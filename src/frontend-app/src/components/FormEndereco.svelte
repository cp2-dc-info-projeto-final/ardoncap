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
	let semNumero = false;
	let semComplemento = false;

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

    if (!form.cep || !form.rua || !form.cidade || !form.estado) {
        error = 'Por favor, preencha todos os campos obrigatórios.';
        submetendo = false;
        return;
    }

    if (!semNumero && !form.numero) {
        error = 'Informe o número ou marque a opção "Sem número (S/N)".';
        submetendo = false;
        return;
    }

    try {
        const dadosEndereco = {
            ...form,
            numero: semNumero ? null : form.numero,
            complemento: semComplemento ? null : form.complemento
        };

        const res = await api.post('/enderecos', dadosEndereco);
        const body = res.data as ApiResponse<any>;

        if (body.success) {
            sucesso = 'Endereço cadastrado com sucesso!';

            form = {
                id: 0,
                cep: '',
                rua: '',
                numero: null,
                cidade: '',
                estado: '',
                complemento: ''
            };

            semNumero = false;
            semComplemento = false;

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

		<!-- Logradouro -->
		<div>
			<Label class="text-xs text-neutral-400 uppercase tracking-wider mb-1 block">
				Logradouro / Rua *
			</Label>
			<Input
				type="text"
				class="bg-neutral-900 border-neutral-800 text-white rounded-xl focus:ring-white focus:border-white"
				placeholder="Nome da rua ou avenida"
				bind:value={form.rua}
				required
			/>
		</div>
	
		<!-- Número e complemento -->
		<div class="grid grid-cols-2 gap-4">
			<div>
				<Label class="text-xs text-neutral-400 uppercase tracking-wider mb-1 block">
					Número
				</Label>
				<Input
					type="number"
					class="bg-neutral-900 border-neutral-800 text-white rounded-xl"
					placeholder="123"
					bind:value={form.numero}
					required={!semNumero}
					disabled={semNumero}
				/>
				<label class="flex items-center gap-2 text-xs text-neutral-400 mt-2 cursor-pointer">
					<input type="checkbox" bind:checked={semNumero} />
					Sem número (S/N)
				</label>
			</div>
	
			<div>
				<Label class="text-xs text-neutral-400 uppercase tracking-wider mb-1 block">
					Complemento
				</Label>
				<Input
					type="text"
					class="bg-neutral-900 border-neutral-800 text-white rounded-xl"
					placeholder="Apto, bloco..."
					bind:value={form.complemento}
					disabled={semComplemento}
				/>
				<label class="flex items-center gap-2 text-xs text-neutral-400 mt-2 cursor-pointer">
					<input type="checkbox" bind:checked={semComplemento} />
					Sem complemento (S/C)
				</label>
			</div>
		</div>
	
		<!-- CEP e cidade -->
		<div class="grid grid-cols-3 gap-4">
			<div>
				<Label class="text-xs text-neutral-400 uppercase tracking-wider mb-1 block">
					CEP *
				</Label>
				<Input
					type="text"
					inputmode="numeric"
					maxlength="8"
					class="bg-neutral-900 border-neutral-800 text-white rounded-xl"
					placeholder="00000000"
					bind:value={form.cep}
					required
				/>
			</div>
	
			<div class="col-span-2">
				<Label class="text-xs text-neutral-400 uppercase tracking-wider mb-1 block">
					Cidade *
				</Label>
				<Input
					type="text"
					class="bg-neutral-900 border-neutral-800 text-white rounded-xl"
					placeholder="Cidade"
					bind:value={form.cidade}
					required
				/>
			</div>
		</div>
	
		<!-- Estado -->
		<div>
			<Label class="text-xs text-neutral-400 uppercase tracking-wider mb-1 block">
				Estado (UF) *
			</Label>
			<Input
				type="text"
				maxlength="2"
				class="bg-neutral-900 border-neutral-800 text-white rounded-xl focus:ring-white focus:border-white uppercase"
				placeholder="RJ"
				bind:value={form.estado}
				oninput={() => form.estado = form.estado.toUpperCase()}
				required
			/>
		</div>
	
		<Button
			type="submit"
			disabled={submetendo}
			class="font-special w-full bg-white text-black hover:bg-gray-300 rounded-xl py-2.5 uppercase tracking-wider mt-2"
		>
			{submetendo ? 'Salvando...' : 'Salvar Endereço'}
		</Button>
	
	</form>	
</Card>