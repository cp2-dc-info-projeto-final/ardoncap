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
        <!-- Passa o id convertido para número -->
        <Profile id={authUser.id} />
    </div>
{/if}