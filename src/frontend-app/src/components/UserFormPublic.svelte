<script lang="ts">
	// Formulário de usuário
	import { Card, Button, Label, Input, Heading } from 'flowbite-svelte'; // UI
	import { onMount } from 'svelte'; // ciclo de vida
	import api from '$lib/api'; // API backend
	import type { ApiFieldError, ApiResponse } from '$lib/api';
	import { goto } from '$app/navigation'; // navegação
	import { ArrowLeftOutline, FloppyDiskAltOutline } from 'flowbite-svelte-icons'; // ícones
	import type { User, UserFormData } from '$lib/models/User';

	export let id: number | null = null; // id do usuário

	let user: UserFormData = { id: 0, login: '', email: '', senha: '' }; // dados do form
	let loading = false;
	let error = '';
	let fieldErrors: ApiFieldError[] = [];

	function errorOf(field: string): string | null {
		return fieldErrors.find((item) => item.field === field)?.message ?? null;
	}

	onMount(async () => {
		if (id !== null) {
			loading = true;
			try {
				const res = await api.get(`/users/public/${id}`);
				const body = res.data as ApiResponse<User>;
				if (body.success && body.data) {
					user = { ...body.data, senha: '' }; // não carrega senha na edição
				} else {
					error = body.message;
				}
			} catch (e: any) {
				const body = e.response?.data as ApiResponse<User> | undefined;
				error = body?.message || 'Erro ao carregar usuário.';
			} finally {
				loading = false;
			}
		}
	});

	// Submissão do formulário
	async function handleSubmit() {
		fieldErrors = [];

		// Validação de senha
		if (id === null && (!user.senha || user.senha.length < 6)) {
			fieldErrors = [{ field: 'senha', message: 'Senha deve ter pelo menos 6 caracteres.' }];
			error = 'Senha deve ter pelo menos 6 caracteres.';
			return;
		}

		if (id !== null && user.senha && user.senha.length < 6) {
			fieldErrors = [{ field: 'senha', message: 'Senha deve ter pelo menos 6 caracteres.' }];
			error = 'Senha deve ter pelo menos 6 caracteres.';
			return;
		}

		loading = true;
		error = '';
		try {
			const userData = { ...user };
			// Remove senha vazia na edição para não sobrescrever indevidamente
			if (id !== null && !userData.senha) {
				delete userData.senha;
			}

			if (id === null) {
				const res = await api.post('users/register', userData);
				const body = res.data as ApiResponse<User>;
				if (!body.success) {
					error = body.message;
					fieldErrors = body.errors;
					return;
				}
			} else {
				const res = await api.put(`/users/editar/${id}`, userData);
				const body = res.data as ApiResponse<User>;
				if (!body.success) {
					error = body.message;
					fieldErrors = body.errors;
					return;
				}
			}
			goto('/profile');
		} catch (e: any) {
			const body = e.response?.data as ApiResponse<User> | undefined;
			error = body?.message || 'Erro ao salvar usuário.';
			fieldErrors = body?.errors || [];
		} finally {
			loading = false;
		}
	}

	function handleCancel() {
		goto('/profile');
	}
</script>

<svelte:head>
	<title>Ardoncap</title>
</svelte:head>

<div class="w-full max-w-3xl px-4 md:px-8">
	<div class="flex h-screen flex-col items-center justify-center bg-black p-4">
		<div class="w-full max-w-sm">
			<!-- Card do formulário -->
			<Card class="w-full border-0 bg-black p-6">
				<!-- Formulário principal -->
				<form class="flex flex-col gap-6 p-6" on:submit|preventDefault={handleSubmit}>
					<!-- Título -->
					<Heading tag="h3" class="font-instrument mb-6 text-center text-4xl text-white">
						{id === null ? 'CADASTRO' : 'Editar Usuário'}
					</Heading>
					<!-- Mensagem de erro -->
					{#if error}
						<div class="text-center text-red-500">{error}</div>
					{/if}
					<!-- Campo login -->
					<div>
						<Label for="login" class="font-special mb-1 text-white">LOGIN:</Label>
						<Input
							class="font-poppins mt-0 mb-2 rounded-2xl text-xs focus:border-gray-200"
							id="login"
							bind:value={user.login}
							placeholder="Digite o login"
							required
						/>

						{#if errorOf('login')}
							<div class="mt-1 text-sm text-red-500">{errorOf('login')}</div>
						{/if}
					</div>
					<!-- Campo email -->
					<div>
						<Label for="email" class="font-special mb-0 text-white">EMAIL:</Label>
						<Input
							class="font-poppins mt-0 mb-2 rounded-2xl text-xs focus:border-gray-200"
							id="email"
							type="email"
							bind:value={user.email}
							placeholder="Digite o e-mail"
							required
						/>

						{#if errorOf('email')}
							<div class="mt-1 text-sm text-red-500">{errorOf('email')}</div>
						{/if}
					</div>
					<!-- Campo senha -->
					<div>
						<Label for="senha" class="font-special mb-0 text-white"
							>SENHA: {id !== null ? '(deixe vazio para manter atual)' : ''}</Label
						>
						<Input
							class="font-poppins mt-0 mb-2 rounded-2xl text-xs focus:border-gray-200"
							id="senha"
							type="password"
							bind:value={user.senha}
							placeholder={id === null
								? 'Digite a senha (mínimo 6 caracteres)'
								: 'Nova senha (opcional)'}
							required={id === null}
							minlength={6}
						/>
						{#if errorOf('senha')}
							<div class="mt-1 text-sm text-red-500">{errorOf('senha')}</div>
						{/if}
					</div>
					<!-- Botões de ação -->
					<div class="mt-4 flex justify-end gap-4">
						<!-- Botão salvar -->
						<Button
							type="submit"
							class="font-special w-3xs rounded-none bg-white text-[1.1rem] text-black hover:bg-gray-300"
							disabled={loading}
						>
							{id === null ? 'CADASTRAR' : 'Salvar'}
						</Button>
						<!-- Botão cancelar/voltar -->
						<Button
							class="font-special w-3xs rounded-none bg-white text-[1.1rem] text-black hover:bg-gray-300"
							onclick={handleCancel}
							disabled={loading}
						>
							<ArrowLeftOutline class="mr-2 inline h-5 w-5 align-text-bottom" />
							{id === null ? 'VOLTAR' : 'Cancelar'}
						</Button>
					</div>
				</form>
			</Card>
		</div>
	</div>
</div>
