<script lang="ts">
    import Menu from '../../components/Menu.svelte';
    import Profile from '../../components/Profile.svelte';
    import { page } from '$app/stores';
    import { get } from 'svelte/store';
    import { CirclePlusOutline } from 'flowbite-svelte-icons';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { getCurrentUser } from '$lib/auth';
    import type { User } from '$lib/auth';

    const { id } = get(page).params;
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
    <div class="mt-27">
        <button class="flex items-center gap-2 px-4 py-2 bg-black-600 hover:bg-gray-800 text-white rounded-lg font-poppins shadow transition" on:click={() => goto(`/profile/edit/${user.id}`)}>
            Editar 
            <CirclePlusOutline class="w-5 h-5" />
        </button>
        <Profile id={Number(id)}/>
    </div>
{/if}