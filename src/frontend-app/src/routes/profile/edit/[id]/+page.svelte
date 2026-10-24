<script lang="ts">
    // Importa o componente de formulário de usuário
    import { page } from '$app/stores';
    import { get } from 'svelte/store';
    import { getCurrentUser } from '$lib/auth';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
	import UserFormPublic from '../../../../components/UserFormPublic.svelte';
    import type { User } from '$lib/auth';
  
    // Captura o parâmetro 'id' da URL
    let loading = true;
    let authUser: User | null = null;
    const { id } = get(page).params;

    onMount(async () => {
        authUser = await getCurrentUser();
        if (!authUser) {
            await goto('/login');
            return;
        }
        loading = false;
    });

  </script>
  {#if id == authUser?.id}
  <!-- Utiliza o componente UserForm passando id -->
  <UserFormPublic id={Number(id)} />
  {/if}