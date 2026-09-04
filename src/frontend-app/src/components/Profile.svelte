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
</script>

<div class="w-full max-w-3xl px-4 md:px-8">
	<div class="flex h-screen flex-col items-center justify-center bg-black p-4">
		<div class="w-full max-w-sm">
			{#if user}
				<div>
                    <p>{user.login}</p>
                    <p>{user.email}</p>
                </div>
			{/if}
		</div>
	</div>
</div>
