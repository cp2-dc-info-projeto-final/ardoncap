<script lang="ts">
    import { onMount } from 'svelte';
    import api from '$lib/api';
    import type { ApiFieldError, ApiResponse } from '$lib/api';
    import type { User, UserFormData } from '$lib/models/User';
	import { Navbar, NavLi, NavUl } from 'flowbite-svelte';
    import { EditOutline } from 'flowbite-svelte-icons';
    import { goto } from '$app/navigation';


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
            <div class="hidden xl:flex items-center justify-between gap-4 w-full max-w-5xl mx-auto my-8 rounded-xl bg-white px-4 py-2">
                <div class="flex flex-col min-w-0 flex-1 px-4 py-2">
                  <span class="truncate text-lg font-light font-special text-black">
                    {user.login}
                  </span>
                  <span class="truncate text-lg font-light font-special text-gray-400">
                    {user.email}
                  </span>
                </div>
                <button class="shrink-0 flex items-center gap-2 px-4 py-2 text-black rounded-lg font-poppins hover:text-gray-400" on:click={() => goto(`/profile/edit/${user.id}`)}>
                  <EditOutline class="shrink-0 h-7 w-7" />
                </button>
              </div>
            {:else}
                <p>Nenhum usuário encontrado.</p>
            {/if}
        </div>
    </div>
</div>