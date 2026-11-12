
<script lang="ts">
    import { Heading } from 'flowbite-svelte';
    import PedidosTable from '../../components/PedidosTable.svelte';
    import { CirclePlusOutline } from 'flowbite-svelte-icons';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { getCurrentUser } from '$lib/auth';
  
    let checkingAccess = true;
    let canView = false;
    let search = '';
  
    /**
     * Se não existir usuário, redireciona para login.
     * Se não for administrador, redireciona para a página inicial.
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
    <div class="text-center p-8 pt-32 text-white">
      Verificando acesso...
    </div>
  {:else if canView}
    <div class="text-center p-8 pt-32">
      <div class="flex items-center justify-between max-w-5xl mx-auto mb-6">
        <Heading
          tag="h2"
          class="block w-full text-center text-5xl font-instrument font-light tracking-tight text-white"
        >
          PEDIDOS
        </Heading>
      </div>
  
      <div class="flex gap-4 justify-center mt-4">
        <div class="relative w-full max-w-xs mt-0 mb-2">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-4 h-4 text-black"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>
  
          <input
            type="text"
            bind:value={search}
            placeholder="Buscar pedido..."
            class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-2xl font-poppins text-xs outline-none focus:border-gray-400 bg-white"
          />
        </div>
      </div>
  
      <PedidosTable search={search} />
    </div>
  {/if}
  