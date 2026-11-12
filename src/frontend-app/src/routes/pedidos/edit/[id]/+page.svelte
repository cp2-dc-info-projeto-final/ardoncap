<script lang="ts">
    import { page } from '$app/stores';
    import { get } from 'svelte/store';
    import PedidoForm from '../../../../components/PedidoForm.svelte';
  
    const { id } = get(page).params;
  </script>
  
  <PedidoForm id={Number(id)} />