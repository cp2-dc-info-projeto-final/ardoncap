<script lang="ts">
	import { Button, Heading } from 'flowbite-svelte';
	import { ShoppingBagOutline, ArrowLeftOutline } from 'flowbite-svelte-icons';
	import { goto } from '$app/navigation';

	import HistoricoPedidos from '../../../components/HistoricoPedidos.svelte';
</script>

<svelte:head>
	<title>Ardoncap - Meus Pedidos</title>
</svelte:head>
<div class="min-h-screen w-full bg-black text-white px-4 pt-32 pb-12 md:px-8">
	<div class="max-w-3xl mx-auto flex flex-col gap-8">
		
		<div class="pb-4 flex items-center justify-between">
			<div class="flex items-center gap-3">
				<ShoppingBagOutline class="h-8 w-8 text-white" />
				<Heading tag="h2" class="font-instrument text-3xl uppercase tracking-wider text-white">Meus Pedidos</Heading>
			</div>
			<Button 
				class="font-special !flex !items-center text-xs text-neutral-400 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 rounded-lg px-3 py-1.5"
				onclick={() => goto('/profile')}
			>
				<ArrowLeftOutline class="mr-1.5 h-4 w-4" /> VOLTAR
			</Button>
		</div>
		<HistoricoPedidos />

	</div>
</div>
