<script lang="ts">
    // Importa o componente de formulário de produto
    import { page } from '$app/stores';
    import { get } from 'svelte/store';
	import ProdutoForm from '../../../../components/ProdutoForm.svelte';
  
    // Captura o parâmetro 'id' da URL
    const { id } = get(page).params;
  </script>
  
  <!-- Utiliza o componente ProdutoForm passando id -->
  <ProdutoForm id={Number(id)} />