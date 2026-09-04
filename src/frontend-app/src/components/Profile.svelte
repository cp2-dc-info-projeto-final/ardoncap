<script lang="ts">
    import { onMount } from 'svelte';
    import api from '$lib/api';
    import type { ApiFieldError, ApiResponse } from '$lib/api';
    import type { User, UserFormData } from '$lib/models/User';

    export let id: number | null = null; // id recebido do componente pai

    let user: UserFormData | null = null; // Começa como null para sabermos quando carregou
    let loading = false;
    let error = '';

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

    // Reativo: sempre que a variável 'id' mudar (inclusive na montagem), recarrega o usuário
    $: loadUser(id);
</script>

<div class="w-full max-w-3xl px-4 md:px-8">
    <div class="flex h-screen flex-col items-center justify-center bg-black p-4">
        <div class="w-full max-w-sm text-white">
            {#if loading}
                <p>Carregando perfil...</p>
            {:else if error}
                <p class="text-red-500">{error}</p>
            {:else if user}
                <div>
                    <p><strong>Login:</strong> {user.login}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                </div>
            {:else}
                <p>Nenhum usuário encontrado.</p>
            {/if}
        </div>
    </div>
</div>