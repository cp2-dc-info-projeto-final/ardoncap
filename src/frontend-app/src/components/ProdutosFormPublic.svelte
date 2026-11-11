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
  
        goto('/');
      } catch (e: any) {
        const body = e.response?.data as ApiResponse<Produto> | undefined;
  
        error = body?.message || 'Erro ao salvar produto.';
        fieldErrors = body?.errors || [];
      } finally {
        loading = false;
      }
    }
  
    function handleCancel() {
      goto('/');
    }
  </script>

  <svelte:head>
	<title>Ardoncap - {id === null ? 'Novo Produto' : 'Editar Produto'}</title>
</svelte:head>

<div class="min-h-screen w-full bg-[#080808] px-5 pb-12 pt-24 md:px-12 md:pt-32">

	<div class="mx-auto max-w-5xl">

		<form
			class="flex flex-col gap-8"
			on:submit|preventDefault={handleSubmit}
		>

			<!-- Cabeçalho -->
			<div class="flex flex-col gap-3 pt-2">

				<Heading
					tag="h1"
					class="!m-0 font-instrument text-5xl font-light uppercase !text-white md:text-6xl"
				>
					{id === null ? 'Novo Produto' : 'Editar Produto'}
				</Heading>

				<p class="font-poppins text-xs text-neutral-500">
					{id === null
						? 'Adicione um novo produto ao catálogo.'
						: 'Gerencie as informações deste produto.'}
				</p>

			</div>

			<!-- Erro geral -->
			{#if error}
				<div class="bg-red-950/30 px-5 py-3 font-poppins text-sm text-red-400">
					{error}
				</div>
			{/if}

			<!-- Conteúdo -->
			<div class="grid grid-cols-1 gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-16">

				<!-- Área da imagem -->
				<div class="flex flex-col gap-5">

					<div class="flex items-center justify-between">
						<span class="font-special text-[10px] tracking-[0.25em] text-neutral-400">
							IMAGEM DO PRODUTO
						</span>

						<span class="font-poppins text-[10px] text-neutral-600">
							Pré-visualização
						</span>
					</div>

					<div class="flex aspect-[4/5] max-h-[480px] items-center justify-center overflow-hidden bg-[#111111] p-8">

						{#if imagemPreviewUrl}
							<img
								src={imagemPreviewUrl}
								alt="Preview do produto"
								class="h-full w-full object-contain"
							/>
						{:else}
							<div class="flex flex-col items-center gap-5 text-center">
								<div class="flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.04]">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="26"
										height="26"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="1"
										class="text-neutral-500"
									>
										<rect x="3" y="3" width="18" height="18" rx="2"/>
										<circle cx="8.5" cy="8.5" r="1.5"/>
										<path d="m21 15-5-5L5 21"/>
									</svg>
								</div>

								<div class="space-y-2">
									<p class="font-special text-xs tracking-widest text-neutral-400">
										SEM IMAGEM
									</p>
									<p class="font-poppins text-[10px] text-neutral-600">
										A imagem aparecerá aqui
									</p>
								</div>
							</div>
						{/if}

					</div>

					<div class="space-y-3">
						<Label for="imagem" class="font-special text-[10px] tracking-[0.2em] text-neutral-400">
							ADICIONAR FOTOGRAFIA
						</Label>

						<Fileupload
							id="imagem"
							accept="image/*"
							class="font-poppins"
							bind:files={arquivosSelecionados}
						/>

						{#if errorOf('imagem_base64')}
							<p class="font-poppins text-xs text-red-400">
								{errorOf('imagem_base64')}
							</p>
						{/if}
					</div>

				</div>

				<!-- Dados do produto -->
				<div class="flex flex-col gap-8">

					<div>
						<span class="font-special text-[10px] tracking-[0.25em] text-neutral-400">
							INFORMAÇÕES DO PRODUTO
						</span>
					</div>

					<!-- Nome -->
					<div class="space-y-3">
						<Label for="nome" class="font-special text-[10px] tracking-[0.2em] text-neutral-400">
							NOME DO PRODUTO
						</Label>

						<Input
							id="nome"
							bind:value={produto.nome}
							placeholder="Ex.: Nome do produto"
							required
							class="!h-12 !rounded-none !border-0 !bg-[#151515] !px-4 font-poppins !text-sm !text-white placeholder:!text-neutral-600 focus:!bg-[#1c1c1c] focus:!ring-1 focus:!ring-white/20"
						/>

						{#if errorOf('nome')}
							<p class="font-poppins text-xs text-red-400">{errorOf('nome')}</p>
						{/if}
					</div>

					<!-- Descrição -->
					<div class="space-y-3">
						<Label for="descricao" class="font-special text-[10px] tracking-[0.2em] text-neutral-400">
							DESCRIÇÃO
						</Label>

						<Textarea
							id="descricao"
							bind:value={produto.descricao}
							placeholder="Descreva os detalhes do produto..."
							rows={4}
							required
							class="!rounded-none !border-0 !bg-[#151515] !px-4 !py-4 font-poppins !text-sm !text-white placeholder:!text-neutral-600 focus:!bg-[#1c1c1c] focus:!ring-1 focus:!ring-white/20"
						/>

						{#if errorOf('descricao')}
							<p class="font-poppins text-xs text-red-400">{errorOf('descricao')}</p>
						{/if}
					</div>

					<!-- Preço e quantidade -->
					<div class="grid grid-cols-2 gap-5">

						<div class="space-y-3">
							<Label for="preco" class="font-special text-[10px] tracking-[0.2em] text-neutral-400">
								PREÇO (R$)
							</Label>

							<Input
								id="preco"
								type="number"
								min="0"
								step="0.01"
								bind:value={produto.preco}
								placeholder="0,00"
								required
								class="number-input !h-12 !rounded-none !border-0 !bg-[#151515] !px-4 font-poppins !text-sm !text-white placeholder:!text-neutral-600 focus:!ring-1 focus:!ring-white/20"
							/>

							{#if errorOf('preco')}
								<p class="font-poppins text-xs text-red-400">{errorOf('preco')}</p>
							{/if}
						</div>

						<div class="space-y-3">
							<Label for="quantidade_disponivel" class="font-special text-[10px] tracking-[0.15em] text-neutral-400">
								QUANTIDADE
							</Label>

							<Input
								id="quantidade_disponivel"
								type="number"
								min="0"
								bind:value={produto.quantidade_disponivel}
								required
								class="number-input !h-12 !rounded-none !border-0 !bg-[#151515] !px-4 font-poppins !text-sm !text-white focus:!ring-1 focus:!ring-white/20"
							/>

							{#if errorOf('quantidade_disponivel')}
								<p class="font-poppins text-xs text-red-400">{errorOf('quantidade_disponivel')}</p>
							{/if}
						</div>

					</div>

					<!-- Categoria -->
					<div class="space-y-3">
						<Label for="id_categoria" class="font-special text-[10px] tracking-[0.2em] text-neutral-400">
							CATEGORIA
						</Label>

						<Select
							id="id_categoria"
							bind:value={produto.id_categoria}
							class="!h-12 !rounded-none !border-0 !bg-[#151515] !px-4 font-poppins !text-sm !text-white focus:!ring-1 focus:!ring-white/20"
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

				</div>

			</div>

			<!-- Ações -->
			<div class="flex flex-col-reverse gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">

				<Button
					type="button"
					onclick={handleCancel}
					disabled={loading}
					class="!rounded-none !border !border-white/15 !bg-transparent px-8 py-3 font-special text-[10px] tracking-[0.2em] !text-white hover:!border-white hover:!bg-white/5"
				>
					<ArrowLeftOutline class="mr-2 h-4 w-4"/>
					VOLTAR
				</Button>

				<Button
					type="submit"
					disabled={loading}
					class="!rounded-none !bg-white px-10 py-3 font-special text-[10px] tracking-[0.2em] !text-black hover:!bg-neutral-300"
				>
					{#if loading}
						SALVANDO...
					{:else}
						{id === null ? 'CADASTRAR PRODUTO' : 'SALVAR ALTERAÇÕES'}
					{/if}
				</Button>

			</div>

		</form>

	</div>

</div>

<style>
	/* Remove as setas dos campos numéricos no Chrome, Safari e Edge */
	:global(.number-input input::-webkit-inner-spin-button),
	:global(.number-input input::-webkit-outer-spin-button) {
		-webkit-appearance: none;
		margin: 0;
	}

	/* Remove as setas dos campos numéricos no Firefox */
	:global(.number-input input[type='number']) {
		-moz-appearance: textfield;
		appearance: textfield;
	}
</style>
