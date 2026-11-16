<script lang="ts">
  import { Card, Button, Label, Input, Heading, Textarea, Select, Fileupload } from 'flowbite-svelte';
  import { onMount } from 'svelte';
  import api from '\$lib/api';
  import type { ApiFieldError, ApiResponse } from '\$lib/api';
  import { goto } from '\$app/navigation';
  import { ArrowLeftOutline, FloppyDiskAltOutline } from 'flowbite-svelte-icons';
  import type { Produto, ProdutoFormData } from '\$lib/models/Produto';

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
  let imagemBase64 = '';
  let imagemPreviewUrl = '';
  let arquivosSelecionados: FileList | null = null;

  let loading = false;
  let error = '';
  let fieldErrors: ApiFieldError[] = [];

  function errorOf(fieldName: string): string {
    const fieldError = fieldErrors.find((e) => e.field === fieldName);
    return fieldError ? fieldError.message : '';
  }

  $: if (arquivosSelecionados && arquivosSelecionados.length > 0) {
    const file = arquivosSelecionados[0];

    imagemPreviewUrl = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.onloadend = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        imagemBase64 = canvas.toDataURL('image/jpeg', 0.7);
      };
    };
    reader.readAsDataURL(file);
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
        const produtoBody = produtoRes.data as ApiResponse<ProdutoFormData & { imagem?: string }>;

        if (produtoBody.success && produtoBody.data) {
          produto = { ...produtoBody.data };
          
          if (produtoBody.data.imagem) {
            imagemBase64 = produtoBody.data.imagem;
            imagemPreviewUrl = produtoBody.data.imagem; // <-- Adicione esta linha!
          }
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
      fieldErrors = [{ field: 'nome', message: 'O produto deve ter pelo menos 3 caracteres.' }];
      error = 'Verifique os campos do formulário.';
      return;
    }

    if (!produto.descricao || produto.descricao.trim().length < 5) {
      fieldErrors = [{ field: 'descricao', message: 'A descrição deve ter pelo menos 5 caracteres.' }];
      error = 'Verifique os campos do formulário.';
      return;
    }

    if (produto.quantidade_disponivel < 0) {
      fieldErrors = [{ field: 'quantidade_disponivel', message: 'A quantidade não pode ser negativa.' }];
      error = 'Verifique os campos do formulário.';
      return;
    }

    if (produto.preco <= 0) {
      fieldErrors = [{ field: 'preco', message: 'O preço deve ser maior que zero.' }];
      error = 'Verifique os campos do formulário.';
      return;
    }

    if (!produto.id_categoria) {
      fieldErrors = [{ field: 'id_categoria', message: 'Selecione uma categoria.' }];
      error = 'Verifique os campos do formulário.';
      return;
    }

    // Validação opcional da imagem (remova se a imagem não for obrigatória)
    if (!imagemBase64 && id === null) {
      fieldErrors = [{ field: 'imagem_base64', message: 'Selecione uma imagem para o produto.' }];
      error = 'Verifique os campos do formulário.';
      return;
    }

    loading = true;

    try {
      const produtoData = {
        nome: produto.nome,
        descricao: produto.descricao,
        quantidade_disponivel: Number(produto.quantidade_disponivel),
        preco: Number(produto.preco),
        id_categoria: Number(produto.id_categoria),
        imagem_base64: imagemBase64 // <-- Nova propriedade enviada para a API
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


<!-- Área administrativa -->
<div class="w-full max-w-3xl px-4 md:px-8">
  <div class="flex min-h-screen flex-col items-center justify-center bg-black p-4 py-10">
    <div class="w-full max-w-md">

      <!-- Card do formulário -->
      <Card class="w-full border-0 bg-black p-0">

        <form
          class="flex flex-col gap-6 p-6"
          on:submit|preventDefault={handleSubmit}
        >

          <!-- Título -->
          <div class="mb-2">
            <Heading
              tag="h3"
              class="mb-2 text-center font-instrument text-3xl text-white"
            >
              {id === null ? 'CADASTRAR PRODUTO' : 'EDITAR PRODUTO'}
            </Heading>

            <p class="text-center font-poppins text-xs tracking-wider text-gray-500">
              GERENCIAMENTO DE PRODUTOS
            </p>
          </div>

          <!-- Mensagem de erro -->
          {#if error}
            <div class="text-center font-poppins text-sm text-red-500">
              {error}
            </div>
          {/if}

          <!-- Pré-visualização da imagem -->
          {#if imagemPreviewUrl}
            <div class="flex flex-col items-center gap-3 rounded-2xl border border-gray-800 bg-[#111111] p-4">
              <p class="font-special text-xs tracking-widest text-gray-400">
                PRÉ-VISUALIZAÇÃO DO PRODUTO
              </p>

              <img
                src={imagemPreviewUrl}
                alt="Preview do produto"
                class="max-h-40 max-w-full rounded-xl object-contain"
              />
            </div>
          {/if}

          <!-- Nome -->
          <div>
            <Label for="nome" class="mb-1 font-special text-white">
              NOME DO PRODUTO:
            </Label>

            <Input
              id="nome"
              bind:value={produto.nome}
              placeholder="Digite o nome do produto"
              required
              class="mt-0 mb-2 rounded-2xl font-poppins text-xs focus:border-gray-200"
            />

            {#if errorOf('nome')}
              <div class="mt-1 text-sm text-red-500">
                {errorOf('nome')}
              </div>
            {/if}
          </div>

          <!-- Descrição -->
          <div>
            <Label for="descricao" class="mb-1 font-special text-white">
              DESCRIÇÃO:
            </Label>

            <Textarea
              id="descricao"
              bind:value={produto.descricao}
              placeholder="Digite a descrição do produto"
              rows={3}
              required
              class="mt-0 mb-2 rounded-2xl font-poppins text-xs focus:border-gray-200"
            />

            {#if errorOf('descricao')}
              <div class="mt-1 text-sm text-red-500">
                {errorOf('descricao')}
              </div>
            {/if}
          </div>

          <!-- Quantidade -->
          <div>
            <Label
              for="quantidade_disponivel"
              class="mb-1 font-special text-white"
            >
              QUANTIDADE DISPONÍVEL:
            </Label>

            <Input
              id="quantidade_disponivel"
              type="number"
              min="0"
              bind:value={produto.quantidade_disponivel}
              required
              class="mt-0 mb-2 rounded-2xl font-poppins text-xs focus:border-gray-200"
            />

            {#if errorOf('quantidade_disponivel')}
              <div class="mt-1 text-sm text-red-500">
                {errorOf('quantidade_disponivel')}
              </div>
            {/if}
          </div>

          <!-- Preço -->
          <div>
            <Label for="preco" class="mb-1 font-special text-white">
              PREÇO:
            </Label>

            <Input
              id="preco"
              type="number"
              min="0"
              step="0.01"
              bind:value={produto.preco}
              placeholder="0.00"
              required
              class="mt-0 mb-2 rounded-2xl font-poppins text-xs focus:border-gray-200"
            />

            {#if errorOf('preco')}
              <div class="mt-1 text-sm text-red-500">
                {errorOf('preco')}
              </div>
            {/if}
          </div>

          <!-- Categoria -->
          <div>
            <Label for="id_categoria" class="mb-1 font-special text-white">
              CATEGORIA:
            </Label>

            <Select
              id="id_categoria"
              bind:value={produto.id_categoria}
              class="mt-0 mb-2 font-poppins text-xs"
              required
            >
              <option value={0}>Selecione uma categoria</option>

              {#each categorias as categoria}
                <option value={categoria.value}>
                  {categoria.name}
                </option>
              {/each}
            </Select>
          </div>

          <!-- Upload da imagem -->
          <div>
            <Label
              for="imagem"
              class="mb-2 block font-special text-white"
            >
              IMAGEM DO PRODUTO:
            </Label>

            <div class="rounded-2xl border border-gray-800 bg-[#111111] p-3">
              <Fileupload
                id="imagem"
                accept="image/*"
                class="font-poppins text-xs"
                bind:files={arquivosSelecionados}
              />
            </div>

            {#if errorOf('imagem_base64')}
              <div class="mt-1 text-sm text-red-500">
                {errorOf('imagem_base64')}
              </div>
            {/if}
          </div>

          <!-- Separador -->
          <div class="mt-2 h-px w-full bg-gray-800"></div>

          <!-- Botões de ação -->
          <div class="mt-2 flex justify-end gap-4">

            <!-- Cancelar -->
            <Button
              type="button"
              onclick={handleCancel}
              disabled={loading}
              class="font-special !flex !items-center !justify-center rounded-xl bg-transparent text-base text-white hover:bg-gray-800"
            >
              <ArrowLeftOutline class="mr-2 inline h-5 w-5" />
              {id === null ? 'VOLTAR' : 'CANCELAR'}
            </Button>

            <!-- Salvar -->
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
