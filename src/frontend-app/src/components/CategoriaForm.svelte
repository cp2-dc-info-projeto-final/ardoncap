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


<!-- Área administrativa -->
<div class="w-full max-w-3xl px-4 md:px-8">
  <div class="flex min-h-screen flex-col items-center justify-center bg-black p-4">
    <div class="w-full max-w-md">
      <!-- Card do formulário -->
      <Card class="w-full border-0 bg-black p-0">

        <form
          class="flex flex-col gap-6 p-6"
          on:submit|preventDefault={handleSubmit}
        >

          <!-- Título -->
          <div class="mb-3">
            <Heading
              tag="h3"
              class="mb-2 text-center font-light font-instrument text-3xl text-white"
            >
              {id === null ? 'CADASTRAR CATEGORIA' : 'EDITAR CATEGORIA'}
            </Heading>

            <p class="text-center font-poppins text-xs tracking-wider text-gray-500">
              GERENCIAMENTO DE CATEGORIAS
            </p>
          </div>

          <!-- Mensagem de erro -->
          {#if error}
            <div class="text-center font-poppins text-sm text-red-500">
              {error}
            </div>
          {/if}

          <!-- Campo nome -->
          <div>
            <Label for="nome" class="mb-1 font-special text-white">
              NOME DA CATEGORIA:
            </Label>

            <Input
              id="nome"
              bind:value={categoria.nome}
              placeholder="Digite o nome da categoria"
              required
              class="mt-0 mb-2 rounded-2xl font-poppins text-xs focus:border-gray-200"
            />

            {#if errorOf('nome')}
              <div class="mt-1 text-sm text-red-500">
                {errorOf('nome')}
              </div>
            {/if}
          </div>

          <!-- Separador -->
          <div class="mt-2 h-px w-full bg-gray-800"></div>

          <!-- Botões de ação -->
          <div class="mt-2 flex justify-end gap-4">

            <!-- Botão cancelar -->
            <Button
              type="button"
              onclick={handleCancel}
              disabled={loading}
              class="font-special !flex !items-center !justify-center rounded-xl bg-transparent text-base text-white hover:bg-gray-800"
            >
              <ArrowLeftOutline class="mr-2 inline h-5 w-5" />
              {id === null ? 'VOLTAR' : 'CANCELAR'}
            </Button>

            <!-- Botão salvar -->
            <Button
              type="submit"
              disabled={loading}
              class="font-special !flex !items-center !justify-center rounded-xl bg-white text-base text-black hover:bg-gray-300"
            >
              {id === null ? 'CADASTRAR' : 'SALVAR'}
            </Button>

          </div>
        </form>
      </Card>

    </div>
  </div>
</div>