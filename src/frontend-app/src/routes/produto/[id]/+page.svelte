<script lang="ts">
    import { page } from '$app/stores';
    import { get } from 'svelte/store';
	import ExibirProduto from '../../../components/ExibirProduto.svelte';

    // Captura o parâmetro 'id' da URL usando a store do SvelteKit de forma síncrona
    const { id } = get(page).params;
</script>

{#if id}
    <!-- Renderiza o componente passando o id capturado da URL -->
    <ExibirProduto {id} />
{:else}
    <div class="text-center p-8 text-red-500 font-poppins">ID de produto inválido.</div>
{/if}