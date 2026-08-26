<script lang="ts">
  import { Card, Button, Label, Input, Heading, Textarea, Select } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import api from '$lib/api';
  import type { ApiFieldError, ApiResponse } from '$lib/api';
  import { goto } from '$app/navigation';
  import { ArrowLeftOutline, FloppyDiskAltOutline } from 'flowbite-svelte-icons';
  import type { Produto, ProdutoFormData } from '$lib/models/Produto';

  export let id: number | null = null;

  let produto: ProdutoFormData = {
    id: 0,
    nome: '',
    descricao: '',
    quantidade_disponivel: 1,
    preco: 0,
    id_categoria: 0
  };

  let categorias: { value: number; name: string }[] = [];

  let loading = false;
  let error = '';
  let fieldErrors: ApiFieldError[] = [];

  function errorOf(fieldName: string): string {
    const fieldError = fieldErrors.find((e) => e.field === fieldName);
    return fieldError ? fieldError.message : '';
  }

  onMount(async () => {
    loading = true;

    try {
      // Carrega categorias para o Select
      const categoriasRes = await api.get('/categorias');
      const categoriasBody = categoriasRes.data as ApiResponse<any[]>;

      if (categoriasBody.success && categoriasBody.data) {
        categorias = categoriasBody.data.map((categoria) => ({
          value: categoria.id,
          name: categoria.nome
        }));
      }

      // Se for edição, carrega o produto
      if (id !== null) {
        const produtoRes = await api.get(`/produtos/${id}`);
        const produtoBody = produtoRes.data as ApiResponse<ProdutoFormData>;

        if (produtoBody.success && produtoBody.data) {
          produto = {
            ...produtoBody.data
          };
        } else {
          error = produtoBody.message;
        }
      }
    } catch (e: any) {
      const body = e.response?.data as ApiResponse<any> | undefined;
      error = body?.message || 'Erro ao carregar dados.';
    } finally {
      loading = false;
    }
  });

  async function handleSubmit() {
    fieldErrors = [];
    error = '';

    // Validações
    if (!produto.nome || produto.nome.trim().length < 3) {
      fieldErrors = [
        {
          field: 'nome',
          message: 'O produto deve ter pelo menos 3 caracteres.'
        }
      ];
      error = 'Verifique os campos do formulário.';
      return;
    }

    if (!produto.descricao || produto.descricao.trim().length < 5) {
      fieldErrors = [
        {
          field: 'descricao',
          message: 'A descrição deve ter pelo menos 5 caracteres.'
        }
      ];
      error = 'Verifique os campos do formulário.';
      return;
    }

    if (produto.quantidade_disponivel < 0) {
      fieldErrors = [
        {
          field: 'quantidade_disponivel',
          message: 'A quantidade não pode ser negativa.'
        }
      ];
      error = 'Verifique os campos do formulário.';
      return;
    }

    if (produto.preco <= 0) {
      fieldErrors = [
        {
          field: 'preco',
          message: 'O preço deve ser maior que zero.'
        }
      ];
      error = 'Verifique os campos do formulário.';
      return;
    }

    if (!produto.id_categoria) {
      fieldErrors = [
        {
          field: 'id_categoria',
          message: 'Selecione uma categoria.'
        }
      ];
      error = 'Verifique os campos do formulário.';
      return;
    }

    loading = true;

    try {
      const produtoData = {
        nome: produto.nome,
        descricao: produto.descricao,
        quantidade_disponivel: produto.quantidade_disponivel,
        preco: produto.preco,
        id_categoria: produto.id_categoria
      };

      let res;

      if (id === null) {
        res = await api.post('/produtos', produtoData);
      } else {
        res = await api.put(`/produtos/${id}`, produtoData);
      }

      const body = res.data as ApiResponse<Produto>;

      if (!body.success) {
        error = body.message;
        fieldErrors = body.errors || [];
        return;
      }

      goto('/produtos');
    } catch (e: any) {
      const body = e.response?.data as ApiResponse<Produto> | undefined;

      error = body?.message || 'Erro ao salvar produto.';
      fieldErrors = body?.errors || [];
    } finally {
      loading = false;
    }
  }

  function handleCancel() {
    goto('/produtos');
  }
</script>

<Card class="max-w-md mx-auto mt-10 p-0 overflow-hidden shadow-lg border border-gray-200 rounded-lg">
  <form
    class="flex flex-col gap-5 p-6"
    on:submit|preventDefault={handleSubmit}
  >
    <Heading tag="h3" class="mb-2 text-center">
      {id === null ? 'Cadastrar Produto' : 'Editar Produto'}
    </Heading>

    {#if error}
      <div class="text-red-500 text-center">
        {error}
      </div>
    {/if}

    <!-- Nome -->
    <div>
      <Label for="nome">Nome do Produto</Label>

      <Input
        id="nome"
        bind:value={produto.nome}
        placeholder="Digite o nome do produto"
        required
        class="mt-1"
      />

      {#if errorOf('nome')}
        <div class="mt-1 text-sm text-red-500">
          {errorOf('nome')}
        </div>
      {/if}
    </div>

    <!-- Descrição -->
    <div>
      <Label for="descricao">Descrição</Label>

      <Textarea
        id="descricao"
        bind:value={produto.descricao}
        placeholder="Digite a descrição do produto"
        rows="4"
        required
        class="mt-1"
      />

      {#if errorOf('descricao')}
        <div class="mt-1 text-sm text-red-500">
          {errorOf('descricao')}
        </div>
      {/if}
    </div>

    <!-- Quantidade -->
    <div>
      <Label for="quantidade_disponivel">
        Quantidade disponível
      </Label>

      <Input
        id="quantidade_disponivel"
        type="number"
        min="0"
        bind:value={produto.quantidade_disponivel}
        required
        class="mt-1"
      />

      {#if errorOf('quantidade_disponivel')}
        <div class="mt-1 text-sm text-red-500">
          {errorOf('quantidade_disponivel')}
        </div>
      {/if}
    </div>

    <!-- Preço -->
    <div>
      <Label for="preco">Preço</Label>

      <Input
        id="preco"
        type="number"
        min="0"
        step="0.01"
        bind:value={produto.preco}
        placeholder="0.00"
        required
        class="mt-1"
      />

      {#if errorOf('preco')}
        <div class="mt-1 text-sm text-red-500">
          {errorOf('preco')}
        </div>
      {/if}
    </div>

    <!-- Categoria -->
    <div>
      <Label for="id_categoria">Categoria</Label>

      <Select
        id="id_categoria"
        bind:value={produto.id_categoria}
        class="mt-1"
        required
      >
        <option value={0}>Selecione uma categoria</option>

        {#each categorias as categoria}
          <option value={categoria.value}>
            {categoria.name}
          </option>
        {/each}
      </Select>

      {#if errorOf('id_categoria')}
        <div class="mt-1 text-sm text-red-500">
          {errorOf('id_categoria')}
        </div>
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
