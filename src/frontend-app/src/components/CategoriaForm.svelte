<script lang="ts">
  // Formulário de categoria
  import { Card, Button, Label, Input, Heading } from 'flowbite-svelte'; // UI
  import { onMount } from 'svelte'; // ciclo de vida
  import api from '$lib/api'; // API backend
  import type { ApiFieldError, ApiResponse } from '$lib/api';
  import { goto } from '$app/navigation'; // navegação
  import { ArrowLeftOutline, FloppyDiskAltOutline } from 'flowbite-svelte-icons'; // ícones
  import type { Categoria } from '$lib/models/Categoria';

  export let id: number | null = null; // id da categoria

  let categoria: Categoria = { id: 0, nome: ''}; // dados do form
  
  let loading = false;
  let error = '';
  let fieldErrors: ApiFieldError[] = [];

  function errorOf(fieldName: string): string {
    const fieldError = fieldErrors.find(e => e.field === fieldName);
    return fieldError ? fieldError.message : '';
  }

  // Carrega categoria se for edição
  onMount(async () => {
    if (id !== null) {
      loading = true;
      try {
        const res = await api.get(`/categorias/${id}`);
        const body = res.data as ApiResponse<Categoria>;
        if (body.success && body.data) {
          categoria = { ...body.data };
        } else {
          error = body.message;
        }
      } catch (e: any) {
        const body = e.response?.data as ApiResponse<Categoria> | undefined;
        error = body?.message || 'Erro ao carregar categoria.';
      } finally {
        loading = false;
      }
    } 
  });

  // Submissão do formulário
  async function handleSubmit() {
    fieldErrors = [];

    // Validação do nome
    if (!categoria.nome || categoria.nome.length < 5) {
      fieldErrors = [{ field: 'nome', message: 'A categoria deve ter pelo menos 5 caracteres.' }];
      error = 'A categoria deve ter pelo menos 5 caracteres.';
      return;
    }

    loading = true;
    error = '';
    try {
      const categoriaData = { ...categoria };
      
      if (id === null) {
        const res = await api.post('/categorias', categoriaData);
        const body = res.data as ApiResponse<Categoria>;
        if (!body.success) {
          error = body.message;
          fieldErrors = body.errors || [];
          return;
        }
      } else {
        const res = await api.put(`/categorias/${id}`, categoriaData);
        const body = res.data as ApiResponse<Categoria>;
        if (!body.success) {
          error = body.message;
          fieldErrors = body.errors || [];
          return;
        }
      }
      goto('/categorias');
    } catch (e: any) {
      const body = e.response?.data as ApiResponse<Categoria> | undefined;
      error = body?.message || 'Erro ao salvar categoria.';
      fieldErrors = body?.errors || [];
    } finally {
      loading = false;
    }
  }

  function handleCancel() {
    goto('/categorias');
  }
</script>

<!-- Card do formulário -->
<Card class="max-w-md mx-auto mt-10 p-0 overflow-hidden shadow-lg border border-gray-200 rounded-lg">
    <!-- Formulário principal -->
    <form class="flex flex-col gap-6 p-6" on:submit|preventDefault={handleSubmit}>
      <!-- Título -->
      <Heading tag="h3" class="mb-2 text-center">
        {id === null ? 'Cadastrar Categoria' : 'Editar Categoria'}
      </Heading>
      <!-- Mensagem de erro -->
      {#if error}
        <div class="text-red-500 text-center">{error}</div>
      {/if}
      <!-- Campo nome -->
      <div>
        <Label for="nome">Nome da Categoria</Label>
        <Input id="nome" bind:value={categoria.nome} placeholder="Digite o nome da categoria" required class="mt-1" />
        {#if errorOf('nome')}
          <div class="mt-1 text-sm text-red-500">{errorOf('nome')}</div>
        {/if}
      </div>
  
      <!-- Botões de ação -->
      <div class="flex gap-4 justify-end mt-4">
        <Button color="light" type="button" onclick={handleCancel} disabled={loading}>
          <ArrowLeftOutline class="inline w-5 h-5 mr-2 align-text-bottom" />
          {id === null ? 'Voltar' : 'Cancelar'}
        </Button>
        <!-- Botão salvar -->
        <Button type="submit" color="red" disabled={loading}>
          <FloppyDiskAltOutline class="inline w-5 h-5 mr-2 align-text-bottom" />
          {id === null ? 'Cadastrar' : 'Salvar'}
        </Button>
      </div>
    </form>
</Card>