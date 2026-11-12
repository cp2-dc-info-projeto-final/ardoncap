
<script lang="ts">
    import {
      Card,
      Button,
      Label,
      Input,
      Heading,
      Select
    } from 'flowbite-svelte';
  
    import {
      ArrowLeftOutline,
      FloppyDiskAltOutline,
      TrashBinOutline,
      CirclePlusOutline
    } from 'flowbite-svelte-icons';
  
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
  
    import api from '$lib/api';
    import type { ApiResponse } from '$lib/api';
  
    export let id: number | null = null;
  
    interface Produto {
      id: number;
      nome: string;
      preco: number;
      imagem?: string;
      quantidade_disponivel: number;
    }
  
    interface ItemForm {
      id_produto: number;
      quantidade: number;
      preco: number;
      status: string;
      nome?: string;
      imagem?: string;
      vendedor?: string;
    }
  
    interface PedidoFormData {
      id_pedido: number;
      id_comprador: number;
      comprador: string;
      email_comprador: string;
      data_pedido: string;
      status_pedido: string;
      rua: string;
      numero: string;
      cidade: string;
      estado: string;
      cep: string;
      complemento?: string;
      items: any[];
    }
  
    let pedido: PedidoFormData = {
      id_pedido: 0,
      id_comprador: 0,
      comprador: '',
      email_comprador: '',
      data_pedido: '',
      status_pedido: 'pendente',
      rua: '',
      numero: '',
      cidade: '',
      estado: '',
      cep: '',
      complemento: '',
      items: []
    };
  
    let produtos: Produto[] = [];
    let items: ItemForm[] = [];
  
    let loading = true;
    let saving = false;
    let error = '';
    let successMessage = '';
  
    const statusOptions = [
      { value: 'pendente', name: 'Pendente' },
      { value: 'enviado', name: 'Enviado' },
      { value: 'entregue', name: 'Entregue' },
      { value: 'cancelado', name: 'Cancelado' }
    ];
  
    // Converte data para o formato datetime-local
    function formatarDataInput(data: string) {
      if (!data) return '';
  
      const date = new Date(data);
  
      if (Number.isNaN(date.getTime())) return '';
  
      const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000
      );
  
      return localDate.toISOString().slice(0, 16);
    }
  
    // Carrega os produtos disponíveis para seleção
    async function carregarProdutos() {
      const res = await api.get('/produtos');
  
      const body = res.data as ApiResponse<Produto[]>;
  
      if (body.success) {
        produtos = body.data ?? [];
      } else {
        throw new Error(body.message || 'Erro ao carregar produtos.');
      }
    }
  
    // Carrega os dados do pedido
    async function carregarPedido() {
      if (id === null) return;
  
      const res = await api.get(`/pedidos/admin/${id}`);
  
      const body = res.data as ApiResponse<PedidoFormData>;
  
      if (!body.success || !body.data) {
        throw new Error(body.message || 'Erro ao carregar pedido.');
      }
  
      pedido = {
        ...body.data,
        data_pedido: formatarDataInput(body.data.data_pedido),
        cep: body.data.cep || '',
        complemento: body.data.complemento || ''
      };
  
      // Converte os valores de centavos para reais
      items = (body.data.items ?? []).map((item: any) => ({
        id_produto: Number(item.id_produto),
        quantidade: Number(item.quantidade),
        preco: Number(item.preco_unitario) / 100,
        status: item.status,
        nome: item.nome,
        imagem: item.imagem,
        vendedor: item.vendedor
      }));
    }
  
    onMount(async () => {
      loading = true;
      error = '';
  
      try {
        if (id === null || !Number.isInteger(id) || id <= 0) {
          throw new Error('ID do pedido inválido.');
        }
  
        await Promise.all([
          carregarProdutos(),
          carregarPedido()
        ]);
  
      } catch (e: any) {
        console.error('Erro ao carregar formulário:', e);
        error = e.response?.data?.message || e.message ||
          'Erro ao carregar dados do pedido.';
      } finally {
        loading = false;
      }
    });
  
    // Atualiza os dados quando o produto é substituído
    function atualizarProduto(item: ItemForm) {
      const produto = produtos.find(
        (p) => p.id === Number(item.id_produto)
      );
  
      if (!produto) return;
  
      item.nome = produto.nome;
      item.imagem = produto.imagem;
      item.preco = Number(produto.preco);
      item.vendedor = '';
      items = [...items];
    }
  
    // Adiciona um novo produto ao pedido
    function adicionarItem() {
      if (produtos.length === 0) {
        error = 'Nenhum produto disponível para adicionar.';
        return;
      }
  
      const produto = produtos[0];
  
      items = [
        ...items,
        {
          id_produto: produto.id,
          quantidade: 1,
          preco: Number(produto.preco),
          status: 'pendente',
          nome: produto.nome,
          imagem: produto.imagem
        }
      ];
  
      error = '';
    }
  
    // Remove um produto do pedido
    function removerItem(index: number) {
      if (items.length <= 1) {
        error = 'O pedido deve possuir pelo menos um produto.';
        return;
      }
  
      items = items.filter((_, i) => i !== index);
      error = '';
    }
  
    // Calcula subtotal
    function subtotal(item: ItemForm) {
      return Number(item.quantidade) * Number(item.preco);
    }
  
    // Calcula valor total
    $: valorTotal = items.reduce(
      (total, item) => total + subtotal(item),
      0
    );
  
    // Formata valores monetários
    function formatarValor(valor: number) {
      return Number(valor).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
    }
  
    // Validação
    function validarFormulario(): boolean {
      if (
        !Number.isInteger(Number(pedido.id_comprador)) ||
        Number(pedido.id_comprador) <= 0
      ) {
        error = 'Informe um ID de comprador válido.';
        return false;
      }
  
      if (!pedido.data_pedido) {
        error = 'Informe a data do pedido.';
        return false;
      }
  
      if (!pedido.rua || !pedido.numero || !pedido.cidade ||
          !pedido.estado || !pedido.cep) {
        error = 'Preencha todos os campos obrigatórios do endereço.';
        return false;
      }
  
      if (items.length === 0) {
        error = 'O pedido deve possuir pelo menos um produto.';
        return false;
      }
  
      for (const item of items) {
        if (
          !Number.isInteger(Number(item.id_produto)) ||
          Number(item.id_produto) <= 0 ||
          !Number.isInteger(Number(item.quantidade)) ||
          Number(item.quantidade) <= 0 ||
          !Number.isFinite(Number(item.preco)) ||
          Number(item.preco) <= 0
        ) {
          error = 'Verifique os dados dos produtos do pedido.';
          return false;
        }
  
        if (!statusOptions.some((s) => s.value === item.status)) {
          error = 'Existe um produto com status inválido.';
          return false;
        }
      }
  
      return true;
    }
  
    // Salva as alterações
    async function handleSubmit() {
      error = '';
      successMessage = '';
  
      if (!validarFormulario()) return;
  
      saving = true;
  
      try {
        const pedidoData = {
          id_usuario: Number(pedido.id_comprador),
          data_pedido: pedido.data_pedido,
          status: pedido.status_pedido,
  
          endereco: {
            rua: pedido.rua,
            numero: pedido.numero,
            cidade: pedido.cidade,
            estado: pedido.estado,
            CEP: pedido.cep,
            complemento: pedido.complemento
          },
  
          items: items.map((item) => ({
            id_produto: Number(item.id_produto),
            quantidade: Number(item.quantidade),
            preco_unitario: Math.round(Number(item.preco) * 100),
            status: item.status
          }))
        };
  
        const res = await api.put(
          `/pedidos/admin/${id}`,
          pedidoData
        );
  
        const body = res.data as ApiResponse<any>;
  
        if (!body.success) {
          error = body.message || 'Erro ao atualizar pedido.';
          return;
        }
  
        successMessage = 'Pedido atualizado com sucesso!';
  
        await goto('/pedidos');
  
      } catch (e: any) {
        console.error('Erro ao atualizar pedido:', e);
  
        const body = e.response?.data as ApiResponse<any> | undefined;
  
        error = body?.message || 'Erro ao salvar alterações.';
      } finally {
        saving = false;
      }
    }
  
    function handleCancel() {
      goto('/pedidos');
    }
  </script>
  
  {#if loading}
    <div class="text-center p-8 pt-32 text-white">
      Carregando pedido...
    </div>
  
  {:else if error && !pedido.id_pedido}
    <div class="text-center p-8 pt-32 text-red-500">
      {error}
      <div class="mt-4">
        <Button color="light" onclick={handleCancel}>
          Voltar
        </Button>
      </div>
    </div>
  
  {:else}
    <div class="min-h-screen w-full bg-black text-white px-4 pt-32 pb-12 md:px-8">
  
      <div class="max-w-3xl mx-auto flex flex-col gap-8">
  
        <!-- Cabeçalho -->
        <div class="flex flex-col gap-4">
  
          <Heading
            tag="h2"
            class="text-center text-4xl font-instrument font-light tracking-tight text-white"
          >
            EDITAR PEDIDO #{pedido.id_pedido}
          </Heading>
  
          <p class="text-center text-sm text-neutral-400">
            Gerenciamento administrativo do pedido
          </p>
        </div>
  
        <form
            class="flex flex-col gap-6"
            onsubmit={(event) => {
                event.preventDefault();
                handleSubmit();
            }}
        >
  
          {#if error}
            <div class="p-3 rounded-lg bg-red-950 border border-red-800 text-red-300 text-sm">
              {error}
            </div>
          {/if}
  
          {#if successMessage}
            <div class="p-3 rounded-lg bg-green-950 border border-green-800 text-green-300 text-sm">
              {successMessage}
            </div>
          {/if}
  
          <!-- Dados principais -->
          <Card class="bg-neutral-950 border border-neutral-800 rounded-2xl">
            <div class="flex flex-col gap-5">
  
              <Heading tag="h3" class="text-xl text-white font-special">
                Dados do pedido
              </Heading>
  
              <div>
                <Label for="id_pedido" class="text-white font-special">
                  Identificação
                </Label>
  
                <Input
                  id="id_pedido"
                  value={pedido.id_pedido}
                  disabled
                  class="mt-1 font-poppins"
                />
              </div>
  
              <div>
                <Label for="id_comprador" class="text-white font-special">
                  ID do comprador
                </Label>
  
                <Input
                  id="id_comprador"
                  type="number"
                  min="1"
                  bind:value={pedido.id_comprador}
                  required
                  class="mt-1 font-poppins"
                />
  
                <p class="text-xs text-neutral-500 mt-1">
                  O servidor validará se o comprador informado existe.
                </p>
  
                <p class="text-xs text-neutral-400 mt-1">
                  Comprador atual: {pedido.comprador}
                  {#if pedido.email_comprador}
                    ({pedido.email_comprador})
                  {/if}
                </p>
              </div>
  
              <div>
                <Label for="data_pedido" class="text-white font-special">
                  Data do pedido
                </Label>
  
                <Input
                  id="data_pedido"
                  type="datetime-local"
                  bind:value={pedido.data_pedido}
                  required
                  class="mt-1 font-poppins"
                />
              </div>
  
              <div>
                <Label for="status_pedido" class="text-white font-special">
                  Status do pedido
                </Label>
  
                <Select
                  id="status_pedido"
                  bind:value={pedido.status_pedido}
                  class="mt-1 font-poppins"
                >
                  {#each statusOptions as status}
                    <option value={status.value}>
                      {status.name}
                    </option>
                  {/each}
                </Select>
              </div>
  
            </div>
          </Card>
  
          <!-- Endereço -->
          <Card class="bg-neutral-950 border border-neutral-800 rounded-2xl">
            <div class="flex flex-col gap-5">
  
              <Heading tag="h3" class="text-xl text-white font-special">
                Endereço de entrega
              </Heading>
  
              <div>
                <Label for="rua" class="text-white font-special">
                  Rua
                </Label>
                <Input
                  id="rua"
                  bind:value={pedido.rua}
                  required
                  class="mt-1 font-poppins"
                />
              </div>
  
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label for="numero" class="text-white font-special">
                    Número
                  </Label>
                  <Input
                    id="numero"
                    bind:value={pedido.numero}
                    required
                    class="mt-1 font-poppins"
                  />
                </div>
  
                <div>
                  <Label for="cep" class="text-white font-special">
                    CEP
                  </Label>
                  <Input
                    id="cep"
                    bind:value={pedido.cep}
                    required
                    class="mt-1 font-poppins"
                  />
                </div>
              </div>
  
              <div>
                <Label for="cidade" class="text-white font-special">
                  Cidade
                </Label>
                <Input
                  id="cidade"
                  bind:value={pedido.cidade}
                  required
                  class="mt-1 font-poppins"
                />
              </div>
  
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <Label for="estado" class="text-white font-special">
                    Estado
                  </Label>
                  <Input
                    id="estado"
                    bind:value={pedido.estado}
                    required
                    class="mt-1 font-poppins"
                  />
                </div>
  
                <div>
                  <Label for="complemento" class="text-white font-special">
                    Complemento
                  </Label>
                  <Input
                    id="complemento"
                    bind:value={pedido.complemento}
                    class="mt-1 font-poppins"
                  />
                </div>
              </div>
  
            </div>
          </Card>
  
          <!-- Produtos -->
          <Card class="bg-neutral-950 border border-neutral-800 rounded-2xl">
            <div class="flex flex-col gap-5">
  
              <div class="flex items-center justify-between gap-3">
                <Heading tag="h3" class="text-xl text-white font-special">
                  Produtos do pedido
                </Heading>
  
                <Button
                  color="light"
                  size="sm"
                  type="button"
                  onclick={adicionarItem}
                  disabled={saving || produtos.length === 0}
                >
                  <CirclePlusOutline class="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
  
              {#each items as item, index}
                <div class="border border-neutral-800 rounded-xl p-4 flex flex-col gap-4">
  
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-neutral-500">
                      ITEM #{index + 1}
                    </span>
  
                    <button
                      type="button"
                      title="Remover produto"
                      class="text-red-400 hover:text-red-300"
                      onclick={() => removerItem(index)}
                      disabled={saving || items.length <= 1}
                    >
                      <TrashBinOutline class="w-5 h-5" />
                    </button>
                  </div>
  
                  {#if item.imagem}
                    <img
                      src={item.imagem}
                      alt={item.nome || 'Produto'}
                      class="w-24 h-24 object-contain rounded-lg bg-neutral-900 p-2"
                    />
                  {/if}
  
                  <div>
                    <Label class="text-white font-special">
                      Produto
                    </Label>
  
                    <Select
                      bind:value={item.id_produto}
                      class="mt-1 font-poppins"
                      on:change={() => atualizarProduto(item)}
                    >
                      {#each produtos as produto}
                        <option value={produto.id}>
                          #{produto.id} - {produto.nome}
                        </option>
                      {/each}
                    </Select>
  
                    <p class="text-xs text-neutral-500 mt-1">
                      {item.nome || 'Selecione um produto'}
                    </p>
                  </div>
  
                  <div class="grid grid-cols-2 gap-4">
  
                    <div>
                      <Label class="text-white font-special">
                        Quantidade
                      </Label>
  
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        bind:value={item.quantidade}
                        required
                        class="mt-1 font-poppins"
                      />
                    </div>
  
                    <div>
                      <Label class="text-white font-special">
                        Preço unitário (R$)
                      </Label>
  
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        bind:value={item.preco}
                        required
                        class="mt-1 font-poppins"
                      />
                    </div>
  
                  </div>
  
                  <div>
                    <Label class="text-white font-special">
                      Status do item
                    </Label>
  
                    <Select
                      bind:value={item.status}
                      class="mt-1 font-poppins"
                    >
                      {#each statusOptions as status}
                        <option value={status.value}>
                          {status.name}
                        </option>
                      {/each}
                    </Select>
                  </div>
  
                  <div class="flex justify-between border-t border-neutral-800 pt-3">
                    <span class="text-sm text-neutral-400">
                      Subtotal
                    </span>
  
                    <span class="font-semibold text-white">
                      {formatarValor(subtotal(item))}
                    </span>
                  </div>
  
                </div>
              {/each}
  
              <!-- Total -->
              <div class="flex justify-between items-center border-t border-neutral-700 pt-5">
                <span class="text-neutral-300 font-special">
                  VALOR TOTAL
                </span>
  
                <span class="text-2xl font-semibold text-white">
                  {formatarValor(valorTotal)}
                </span>
              </div>
  
              <p class="text-xs text-neutral-500">
                O valor total será recalculado e validado pelo servidor.
              </p>
  
            </div>
          </Card>
  
          <!-- Ações -->
          <div class="flex flex-col sm:flex-row gap-4 justify-between mt-2">
  
            <Button
              color="light"
              type="button"
              onclick={handleCancel}
              disabled={saving}
              class="font-special"
            >
              <ArrowLeftOutline class="w-5 h-5 mr-2" />
              Cancelar
            </Button>
  
            <Button
              type="submit"
              color="dark"
              disabled={saving}
              class="font-special"
            >
              <FloppyDiskAltOutline class="w-5 h-5 mr-2" />
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </Button>
  
          </div>
  
        </form>
      </div>
    </div>
  {/if}
  