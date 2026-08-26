<script lang="ts">
    // Importa o componente de formulário de categoria
    import CategoriaForm from '../../../../components/CategoriaForm.svelte';
    import { page } from '$app/stores';
    import { get } from 'svelte/store';
  
    // Captura o parâmetro 'id' da URL
    const { id } = get(page).params;
  </script>
  
  <!-- Utiliza o componente CategoriaForm passando id -->
  <CategoriaForm id={Number(id)} />