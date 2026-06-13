<script>
  // Formulário de produto
  import { Card, Button, Label, Input, Heading, Select, Textarea } from 'flowbite-svelte'; 
  import { onMount } from 'svelte'; 
  import api from '$lib/api'; 
  import type { ApiFieldError, ApiResponse } from '$lib/api';
  import { goto } from '$app/navigation'; 
  import { ArrowLeftOutline, FloppyDiskAltOutline } from 'flowbite-svelte-icons'; 
  import type { Produto, ProdutoFormData } from '$lib/models/Produto';
  import type { Categoria } from '$lib/models/Categoria';

  export let id: number | null = null; 

let categorias: { value: number, name: string }[] = [];
let loading = false;
let error = '';
let fieldErrors: ApiFieldError[] = [];

function errorOf(field: string): string | null {
    return fieldErrors.find((item) => item.field === field)?.message ?? null;
  }

</script>