<script lang="ts">
    // Importa o componente de formulário de usuário
    import { page } from '$app/stores';
    import { get } from 'svelte/store';
	import UserFormPublic from '../../../../components/UserFormPublic.svelte';
  
    // Captura o parâmetro 'id' da URL
    const { id } = get(page).params;
  </script>
  
  <!-- Utiliza o componente UserForm passando id -->
  <UserFormPublic id={Number(id)} />