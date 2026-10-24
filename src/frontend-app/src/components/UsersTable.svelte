<script lang="ts">
  export let search = '';
  
  // Tabela de usuários
  import { Table, TableHead, TableHeadCell, TableBody, TableBodyRow, TableBodyCell, Card, Badge, Button} from 'flowbite-svelte'; // UI
  import ConfirmModal from './ConfirmModal.svelte'; // modal de confirmação
  import { UserEditOutline, TrashBinOutline, FloppyDiskAltOutline, UndoOutline } from 'flowbite-svelte-icons'; // ícones
  import { goto } from '$app/navigation'; // navegação
  import api from '$lib/api'; // API backend
  import type { ApiResponse } from '$lib/api';
  import { onMount } from 'svelte'; // ciclo de vida
  import type { User } from '$lib/models/User';
	import type { USER } from '$env/static/private';

  let users: User[] = [];   // lista de usuários

  $: loadUsers(search);
  async function loadUsers(searchTerm: string) {
    loading = false;
    try {
      const res = await api.get('/users', {
        params: {
          search: searchTerm
        }
      });
  
      const body = res.data as ApiResponse<User[]>;
      if (body.success) {
        users = body.data ?? [];
      } else {
        error = body.message;
      }
    } catch (e: any) {
      console.error('Erro ao carregar usuários:', e);
  
      const body = e.response?.data as ApiResponse<User[]> | undefined;
      error = body?.message || 'Erro ao carregar usuários';
    } finally {
      loading = false;
    }
  }

  let loading = true;
  let error = '';
  let deletingId: number | null = null; // id em deleção
  let confirmOpen = false; // modal aberto?
  let confirmTargetId: number | null = null; // id alvo do modal

  // Abre modal de confirmação
  function openConfirm(id: number) {
    confirmTargetId = id;
    confirmOpen = true;
  }
  // Fecha modal
  function closeConfirm() {
    confirmOpen = false;
    confirmTargetId = null;
  }

  // Confirma remoção
  function handleConfirm() {
    if (confirmTargetId !== null) {
      handleDelete(confirmTargetId);
    }
    closeConfirm();
  }

  // Cancela remoção
  function handleCancel() {
    closeConfirm();
  }

  // Retorna ao painel
  function painel() {
      goto('/painel');
    }

  async function handleDelete(id: number) {
    deletingId = id;
    error = '';
    try {
      const res = await api.delete(`/users/${id}`);
      const body = res.data as ApiResponse<null>;
      if (!body.success) {
        error = body.message;
        return;
      }
      users = users.filter(user => user.id !== id);
    } catch (e: any) {
      console.error('Erro ao deletar usuário:', e);
      const body = e.response?.data as ApiResponse<null> | undefined;
      error = body?.message || 'Erro ao remover usuário.';
    } finally {
      deletingId = null;
    }
  }

  onMount(async () => {
    try {
      const res = await api.get('/users');
      const body = res.data as ApiResponse<User[]>;
      if (body.success) {
        users = body.data ?? [];
      } else {
        error = body.message;
      }
    } catch (e: any) {
      console.error('Erro ao carregar usuários:', e);
      const body = e.response?.data as ApiResponse<User[]> | undefined;
      error = body?.message || 'Erro ao carregar usuários';
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <div class="my-8 text-center text-black">Carregando usuários...</div>
{:else if error}
  <div class="my-8 text-center text-red-500">{error}</div>
{:else}
  <!-- Tabela para telas médias/grandes -->
  <div class="w-full max-w-2xl mx-auto my-8 rounded-xl overflow-y-auto border border-gray-300 hidden xl:block">
    <!-- Tabela de usuários -->
    <Table class="w-full table-fixed border-separate border-spacing-0">
      <TableHead class="sticky top-0 z-0">
        <TableHeadCell class="text-black w-16 bg-gray-300 font-poppins">ID</TableHeadCell>
        <TableHeadCell class="text-black w-32 bg-gray-300 font-poppins">Login</TableHeadCell>
        <TableHeadCell class="text-black w-36 bg-gray-300 font-poppins">Email</TableHeadCell>
        <TableHeadCell class="text-black w-24 bg-gray-300 font-poppins">Role</TableHeadCell>
        <TableHeadCell class="w-24 bg-gray-300"></TableHeadCell> <!-- coluna para editar/remover -->
      </TableHead>
      <TableBody>
        {#if users.length === 0}
          <TableBodyRow>
            <TableBodyCell colspan="5" class="text-center text-gray-400 py-8">
              Nenhum usuário encontrado.
            </TableBodyCell>
          </TableBodyRow>
        {:else}
          {#each users as user}
            <TableBodyRow>
              <TableBodyCell class="text-black truncate font-poppins">{user.id}</TableBodyCell>
              <TableBodyCell class="text-black truncate font-poppins">{user.login}</TableBodyCell>
              <TableBodyCell class="text-black truncate font-poppins">{user.email}</TableBodyCell>
              <TableBodyCell>
                <Badge color={user.role === 'admin' ? 'blue' : 'gray'} class="text-xs">
                  {user.role}
                </Badge>
              </TableBodyCell>
              <TableBodyCell>
                <!-- Botão editar -->
                <button
                  class="p-2 rounded border border-black hover:border-gray-300 transition bg-transparent"
                  title="Editar"
                  on:click={() => goto(`/users/edit/${user.id}`)}
                >
                  <UserEditOutline class="w-5 h-5 text-black" />
                </button>
                <!-- Botão remover -->
                <button
                  title="Remover"
                  class="p-2 rounded border border-black hover:border-gray-300 transition bg-transparent"
                  on:click={() => openConfirm(user.id)}
                  disabled={deletingId === user.id || loading}
                >
                  <TrashBinOutline class="w-5 h-5 text-black" />
                </button>
              </TableBodyCell>
            </TableBodyRow>
          {/each}
        {/if}
      </TableBody>
    </Table>
  </div>
  <!-- Cards para telas pequenas -->
  <div class="block xl:hidden">
    <div class="flex flex-col items-center gap-4 my-8 max-w-3xl mx-auto md:grid md:grid-cols-2">
      {#each users as user}
        <!-- Card de usuário -->
        <Card class="max-w-sm w-full p-0 overflow-hidden shadow-lg border-gray-200">
          <div class="px-4 pt-4 pb-2 bg-gray-100 text-left flex items-center justify-between">
            <div>
              <div class="text-lg font-semibold text-gray-800 text-left">{user.login}</div>
              <div class="text-xs text-gray-400 text-left">ID: {user.id}</div>
              <Badge color={user.role === 'admin' ? 'red' : 'blue'} class="text-xs mt-1">
                {user.role}
              </Badge>
            </div>
            <div class="flex gap-2">
              <!-- Botão editar -->
              <button
                class="p-2 rounded border border-primary-200 hover:border-primary-400 transition bg-transparent"
                title="Editar"
                on:click={() => goto(`/users/edit/${user.id}`)}
              >
                <UserEditOutline class="w-5 h-5 text-primary-500" />
              </button>
              <!-- Botão remover -->
              <button
                title="Remover"
                class="p-2 rounded border border-red-100 hover:border-red-300 transition bg-transparent"
                on:click={() => openConfirm(user.id)}
                disabled={deletingId === user.id || loading}
              >
                <TrashBinOutline class="w-5 h-5 text-red-400" />
              </button>
            </div>
          </div>
          <div class="px-4 pb-4 pt-2 flex flex-col gap-2 text-left">
            <div class="flex items-center gap-2 text-left">
              <!-- Ícone de email -->
              <svg class="w-4 h-4 text-primary-400 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 12A4 4 0 1 0 8 12a4 4 0 0 0 8 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 14v7m-7-7v7m14-7v7"/></svg>
              <span class="text-gray-700 text-sm">{user.email}</span>
            </div>
          </div>
        </Card>
      {/each}
    </div>
  </div>
{/if}

<!-- Modal de confirmação -->
<ConfirmModal
  open={confirmOpen}
  message="Tem certeza que deseja remover este usuário?"
  confirmText="Remover"
  cancelText="Cancelar"
  onConfirm={handleConfirm}
  onCancel={handleCancel}
/>

<!-- Botão de voltar -->
<div class="flex gap-4 justify-center mt-4">
  <Button color="light" type="button" onclick={painel} disabled={loading} class="font-special flex items-center justify-center">
    <UndoOutline class="w-5 h-5 font-special" />
  </Button>
</div>