<script lang="ts">
  import { Heading } from 'flowbite-svelte';
  import UsersTable from '../../components/UsersTable.svelte';
  import { CirclePlusOutline } from 'flowbite-svelte-icons';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { getCurrentUser } from '$lib/auth';

  let checkingAccess = true;
  let canView = false;
  let search = '';

  /**
   * se não existir usuário redireciona para a página de login
   * se não for admin redireciona para a página inicial
   */
  onMount(async () => {
    const user = await getCurrentUser();
    if (!user) {
      await goto('/login');
      return;
    } else if (user.role !== 'admin') {
      await goto('/');
      return;
    }

    canView = true;
    checkingAccess = false;
  });
</script>

{#if checkingAccess}
  <div class="text-center p-8 pt-32 text-white">Verificando acesso...</div>
{:else if canView}
  <div class="text-center p-8 pt-32">
    <div class="flex items-center justify-between max-w-3xl mx-auto mb-6">
      <Heading tag="h2" class="text-4xl font-instrument tracking-tight text-white">USUÁRIOS</Heading>
      <button class="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-800 text-white rounded-lg font-poppins shadow transition" on:click={() => goto('/users/new')}>
        <CirclePlusOutline class="w-5 h-5" />
        Adicionar
      </button>
    </div>
    <div>
      <input type="text"
      bind:value={search}
      class="rounded-lg" placeholder="Pesquisar por login...">
    </div>
    <UsersTable search={search}/>
  </div>
{/if}
