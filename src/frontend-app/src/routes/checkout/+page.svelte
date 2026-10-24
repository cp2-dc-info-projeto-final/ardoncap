<script lang="ts">
	import { onMount } from 'svelte';
	import { cart } from '$lib/cart';
	import { Card, Button, Heading, Radio } from 'flowbite-svelte';
	import { MapPinOutline, CreditCardOutline, ArrowLeftOutline } from 'flowbite-svelte-icons';
	import { goto } from '$app/navigation';
	import api from '$lib/api';
	import type { ApiResponse } from '$lib/api';
	import type { Endereco } from '$lib/models/Endereco';
	import type { PedidoFormData } from '$lib/models/Pedido';

	let enderecos: Endereco[] = [];
	let idEnderecoSelecionado: number | null = null;
	let loadingEnderecos = true;
	let finalizando = false;
	let error = '';

	// Cálculos do Carrinho
	$: valorTotal = $cart.reduce((acumulador, item) => acumulador + (item.produto.preco * item.quantidade), 0);
	$: totalItens = $cart.reduce((acumulador, item) => acumulador + item.quantidade, 0);

	async function carregarEnderecos() {
		try {
			const res = await api.get('/enderecos');
			const body = res.data as ApiResponse<Endereco[]>;
			if (body.success) {
				enderecos = body.data ?? [];
				// Pré-seleciona o primeiro endereço se houver
				if (enderecos.length > 0) {
					idEnderecoSelecionado = enderecos[0].id;
				}
			}
		} catch (e: any) {
			console.error('Erro ao carregar endereços para o checkout:', e);
			error = 'Não foi possível carregar os seus endereços de entrega.';
		} finally {
			loadingEnderecos = false;
		}
	}

	async function fecharPedido() {
		if (!idEnderecoSelecionado) {
			error = 'Por favor, selecione ou cadastre um endereço de entrega.';
			return;
		}

		finalizando = true;
		error = '';

		// Monta o payload conforme a interface PedidoFormData mapeada no backend
		const payload: PedidoFormData = {
			id_endereco: idEnderecoSelecionado,
			items: $cart.map(item => ({
				id_produto: item.produto.id,
				quantidade: item.quantidade
			}))
		};

		try {
			const res = await api.post('/pedidos', payload);
			const body = res.data as ApiResponse<{ id_pedido: number }>;

			if (body.success && body.data) {
				// Limpa o carrinho localstorage e redireciona para confirmação ou histórico
				cart.limpar();
				alert('Pedido realizado com sucesso!');
				await goto('/profile'); // Redireciona para o perfil onde ficará o histórico
			} else {
				error = body.message || 'Erro ao processar o seu pedido.';
			}
		} catch (e: any) {
			const body = e.response?.data as ApiResponse<any> | undefined;
			error = body?.message || 'Erro de comunicação ao fechar pedido.';
		} finally {
			finalizando = false;
		}
	}

	onMount(async () => {
		// Se tentar acessar o checkout com o carrinho vazio, volta para a loja
		if ($cart.length === 0) {
			await goto('/produtos');
			return;
		}
		await carregarEnderecos();
	});
</script>

<svelte:head>
	<title>Ardoncap - Finalizar Pedido</title>
</svelte:head>

<div class="min-h-screen w-full bg-black text-white px-4 pt-32 pb-12 md:px-8">
	<div class="max-w-5xl mx-auto flex flex-col gap-8">
		
		<!-- Título principal -->
		<div class="border-b border-neutral-800 pb-4 flex items-center gap-3">
			<CreditCardOutline class="h-8 w-8 text-neutral-400" />
			<Heading tag="h2" class="font-instrument text-3xl uppercase tracking-wider">Finalizar Compra</Heading>
		</div>

		{#if error}
			<div class="text-sm text-red-500 font-poppins bg-red-950/30 p-4 rounded-xl border border-red-900/50">
				{error}
			</div>
		{/if}

		<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
			
			<!-- SELEÇÃO DE ENDEREÇO (Ocupa 2 colunas) -->
			<div class="lg:col-span-2 flex flex-col gap-6">
				<Card class="w-full p-6 bg-neutral-950 border border-neutral-900 rounded-2xl flex flex-col gap-4">
					<span class="font-special text-xs text-neutral-500 tracking-widest uppercase flex items-center gap-2">
						<MapPinOutline class="h-4 w-4" /> Endereço de Entrega
					</span>

					{#if loadingEnderecos}
						<div class="py-6 text-neutral-500 font-poppins animate-pulse">Buscando endereços...</div>
					{:else if enderecos.length === 0}
						<div class="text-center py-6 border border-dashed border-neutral-800 rounded-xl flex flex-col gap-3 items-center">
							<p class="text-xs text-neutral-400 font-poppins">Nenhum endereço cadastrado no seu perfil.</p>
							<Button 
								class="font-special text-xs bg-white text-black hover:bg-gray-300 rounded-xl px-4 py-2"
								onclick={() => goto('/profile/endereco')}
							>
								Cadastrar Endereço
							</Button>
						</div>
					{:else}
						<div class="flex flex-col gap-3 text-left">
							{#each enderecos as item (item.id)}
								<label class="flex items-start gap-4 p-4 bg-neutral-900 border {idEnderecoSelecionado === item.id ? 'border-white' : 'border-neutral-800'} rounded-xl cursor-pointer transition-all hover:bg-neutral-800">
									<input 
										type="radio" 
										name="endereco" 
										class="mt-1 text-black focus:ring-0" 
										value={item.id} 
										bind:group={idEnderecoSelecionado} 
									/>
									<div class="flex flex-col min-w-0 font-poppins text-xs text-neutral-300">
										<span class="font-special text-sm text-white uppercase tracking-wide mb-0.5">{item.rua}, Nº {item.numero}</span>
										{#if item.complemento}<span>Comp: {item.complemento}</span>{/if}
										<span>{item.cidade} — {item.estado.toUpperCase()}</span>
										<span class="text-neutral-500 mt-1 text-[0.65rem]">CEP: {item.cep}</span>
									</div>
								</label>
							{/each}
						</div>
					{/if}
				</Card>

				<!-- RESUMO DOS ITENS COMPRADOS -->
				<Card class="w-full p-6 bg-neutral-950 border border-neutral-900 rounded-2xl flex flex-col gap-4">
					<span class="font-special text-xs text-neutral-500 tracking-widest uppercase">Revisar Itens ({totalItens})</span>
					<div class="flex flex-col gap-3">
						{#each $cart as item}
							<div class="flex items-center justify-between gap-4 p-2 border-b border-neutral-900 last:border-0">
								<div class="flex items-center gap-3 min-w-0">
									<div class="w-10 h-10 bg-neutral-900 rounded-lg flex items-center justify-center p-1 overflow-hidden shrink-0">
										{#if item.produto.imagem}
											<img src={item.produto.imagem} alt={item.produto.nome} class="max-w-full max-h-full object-contain" />
										{/if}
									</div>
									<div class="flex flex-col min-w-0">
										<span class="font-special text-xs uppercase tracking-wide truncate text-gray-200">{item.produto.nome}</span>
										<span class="text-[0.65rem] text-neutral-500 font-poppins">{item.quantidade}x</span>
									</div>
								</div>
								<span class="font-poppins text-xs font-medium text-white">
									{(item.produto.preco * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
								</span>
							</div>
						{/each}
					</div>
				</Card>
			</div>

			<!-- QUADRO DE FECHAMENTO FINANCEIRO -->
			<div>
				<Card class="w-full p-6 bg-neutral-950 border border-neutral-900 rounded-2xl flex flex-col gap-6 sticky top-32">
					<span class="font-special text-xs text-neutral-500 tracking-widest uppercase">Resumo Financeiro</span>
					
					<div class="flex flex-col gap-3 font-poppins text-sm">
						<div class="flex justify-between text-neutral-400">
							<span>Subtotal:</span>
							<span>{valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
						</div>
						<div class="flex justify-between text-neutral-400">
							<span>Entrega (PAC):</span>
							<span class="text-green-500 uppercase text-xs tracking-wider font-semibold">Grátis</span>
						</div>
						<div class="border-t border-neutral-900 my-2"></div>
						<div class="flex justify-between items-baseline">
							<span class="font-special text-xs tracking-wider text-neutral-400 uppercase">Total Geral:</span>
							<span class="text-2xl font-bold text-white">
								{valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
							</span>
						</div>
					</div>

					<Button 
						class="font-special w-full bg-white text-black hover:bg-gray-300 rounded-xl text-[1.1rem] py-3 uppercase tracking-wider"
						disabled={finalizando || enderecos.length === 0}
						onclick={fecharPedido}
					>
						{finalizando ? 'Processando...' : 'Confirmar Pedido'}
					</Button>

					<button 
						class="font-special text-xs text-neutral-500 hover:text-neutral-300 uppercase tracking-widest flex items-center justify-center gap-1.5"
						onclick={() => goto('/carrinho')}
					>
						<ArrowLeftOutline class="h-4 w-4" /> Voltar ao Carrinho
					</button>
				</Card>
			</div>

		</div>
	</div>
</div>
