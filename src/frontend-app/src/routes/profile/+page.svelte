<script lang="ts">
    import Menu from '../../components/Menu.svelte';
    import { CirclePlusOutline } from 'flowbite-svelte-icons';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { getCurrentUser } from '$lib/auth';
    import type { User } from '$lib/auth';

    let user: User | null = null;
    let loading = true;

    onMount(async () => {
        user = await getCurrentUser();
        if (!user) {
            await goto('/login');
            return;
        }
        loading = false;
    });
    
</script>

{#if loading}
    <div class="text-center p-8 pt-32 text-white">Carregando...</div>
{:else if user}
    <Menu />
    <button class="flex items-center gap-2 px-4 py-2 bg-black-600 hover:bg-gray-800 text-white rounded-lg font-poppins shadow transition" on:click={() => goto(`/profile/edit/${user.id}`)}>
        Editar 
        <CirclePlusOutline class="w-5 h-5" />
    </button>
{/if}