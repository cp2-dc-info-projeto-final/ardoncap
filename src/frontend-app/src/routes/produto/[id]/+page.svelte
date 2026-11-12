<script lang="ts">
    import { page } from '$app/stores';
    import { get } from 'svelte/store';
	import ExibirProduto from '../../../components/ExibirProduto.svelte';
    const { id } = get(page).params;
</script>

{#if id}
    <div class="pt-24">
        <ExibirProduto {id} />
    </div>
{:else}
    <div class="text-center p-8 text-red-500 font-poppins">ID de produto inválido.</div>
{/if}