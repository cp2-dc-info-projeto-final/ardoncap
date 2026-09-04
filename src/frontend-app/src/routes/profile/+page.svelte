<script lang="ts">
    import Menu from '../../components/Menu.svelte';
    import Profile from '../../components/Profile.svelte';
    import { page } from '$app/stores';
    import { CirclePlusOutline } from 'flowbite-svelte-icons';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { getCurrentUser } from '$lib/auth';
    import type { User } from '$lib/auth';

    // Pega o id direto do store do SvelteKit de forma reativa ou segura
    $: routeId = $page.params.id; 

    let authUser: User | null = null;
    let loading = true;

    onMount(async () => {
        authUser = await getCurrentUser();
        if (!authUser) {
            await goto('/login');
            return;
        }
        loading = false;
    });
</script>

{#if loading}
    <div class="text-center p-8 pt-32 text-white">Carregando...</div>
{:else if authUser}
    <Menu />
    <div class="mt-27">
        <button class="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-poppins shadow transition" on:click={() => goto(`/profile/edit/${authUser.id}`)}>
            Editar 
            <CirclePlusOutline class="w-5 h-5" />
        </button>
        <!-- Passa o id convertido para número -->
        <Profile id={Number(routeId)} />
    </div>
{/if}