<script lang="ts">
  // Formulário de usuário
  import { Card, Button, Label, Input, Heading, Select } from 'flowbite-svelte'; // UI
  import { onMount } from 'svelte'; // ciclo de vida
  import api from '$lib/api'; // API backend
  import type { ApiFieldError, ApiResponse } from '$lib/api';
  import { goto } from '$app/navigation'; // navegação
  import { ArrowLeftOutline, FloppyDiskAltOutline, ShieldCheckOutline } from 'flowbite-svelte-icons'; // ícones
  import type { User, UserFormData } from '$lib/models/User';

  export let id: number | null = null; // id do usuário

  let user: UserFormData = { id: 0, login: '', email: '', senha: '', role: 'user' }; // dados do form
  
  // Opções de roles
  const roleOptions = [
    { value: 'user', name: 'Usuário' },
    { value: 'admin', name: 'Administrador' }
  ];
  let loading = false;
  let error = '';
  let fieldErrors: ApiFieldError[] = [];

  function errorOf(field: string): string | null {
    return fieldErrors.find((item) => item.field === field)?.message ?? null;
  }

  // Carrega usuário se for edição
  onMount(async () => {
    if (id !== null) {
      loading = true;
      try {
        const res = await api.get(`/users/${id}`);
        const body = res.data as ApiResponse<User>;
        if (body.success && body.data) {
          user = { ...body.data, senha: '' }; // não carrega senha na edição
        } else {
          error = body.message;
        }
      } catch (e: any) {
        const body = e.response?.data as ApiResponse<User> | undefined;
        error = body?.message || 'Erro ao carregar usuário.';
      } finally {
        loading = false;
      }
    } 
  });

  // Submissão do formulário
  async function handleSubmit() {
    fieldErrors = [];

    // Validação de senha
    if (id === null && (!user.senha || user.senha.length < 6)) {
      fieldErrors = [{ field: 'senha', message: 'Senha deve ter pelo menos 6 caracteres.' }];
      error = 'Senha deve ter pelo menos 6 caracteres.';
      return;
    }
    
    if (id !== null && user.senha && user.senha.length < 6) {
      fieldErrors = [{ field: 'senha', message: 'Senha deve ter pelo menos 6 caracteres.' }];
      error = 'Senha deve ter pelo menos 6 caracteres.';
      return;
    }

    loading = true;
    error = '';
    try {
      const userData = { ...user };
      // Remove senha vazia na edição para não sobrescrever indevidamente
      if (id !== null && !userData.senha) {
        delete userData.senha;
      }
      
      if (id === null) {
        const res = await api.post('/users', userData);
        const body = res.data as ApiResponse<User>;
        if (!body.success) {
          error = body.message;
          fieldErrors = body.errors;
          return;
        }
      } else {
        const res = await api.put(`/users/${id}`, userData);
        const body = res.data as ApiResponse<User>;
        if (!body.success) {
          error = body.message;
          fieldErrors = body.errors;
          return;
        }
      }
      goto('/users');
    } catch (e: any) {
      const body = e.response?.data as ApiResponse<User> | undefined;
      error = body?.message || 'Erro ao salvar usuário.';
      fieldErrors = body?.errors || [];
    } finally {
      loading = false;
    }
  }

  function handleCancel() {
    goto('/users');
  }
</script>


<!-- Card do formulário administrativo -->
<div class="w-full px-4 md:px-8">
  <div class="flex min-h-screen flex-col items-center justify-center bg-black py-10">
    <div class="w-full max-w-md">

      <!-- Card -->
      <Card class="w-full border-0 bg-black p-0 shadow-none">

        <!-- Formulário principal -->
        <form
          class="flex flex-col gap-6 p-6"
          on:submit|preventDefault={handleSubmit}
        >

          <!-- Título -->
          <div class="mb-2">
            <Heading
              tag="h3"
              class="font-instrument font-light text-center text-3xl text-white"
            >
              {id === null ? 'CADASTRAR USUÁRIO' : 'EDITAR USUÁRIO'}
            </Heading>

            <p class="mt-2 text-center font-poppins text-xs tracking-wide text-gray-500">
              GERENCIAMENTO DE ACESSOS E PERMISSÕES
            </p>
          </div>

          <!-- Mensagem de erro -->
          {#if error}
            <div class="text-center font-poppins text-sm text-red-500">
              {error}
            </div>
          {/if}

          <!-- Campo login -->
          <div>
            <Label for="login" class="mb-1 font-special text-white">
              LOGIN:
            </Label>

            <Input
              id="login"
              bind:value={user.login}
              placeholder="Digite o login"
              required
              class="mt-0 mb-2 rounded-2xl font-poppins text-xs focus:border-gray-200"
            />

            {#if errorOf('login')}
              <div class="mt-1 text-sm text-red-500">
                {errorOf('login')}
              </div>
            {/if}
          </div>

          <!-- Campo email -->
          <div>
            <Label for="email" class="mb-1 font-special text-white">
              EMAIL:
            </Label>

            <Input
              id="email"
              type="email"
              bind:value={user.email}
              placeholder="Digite o e-mail"
              required
              class="mt-0 mb-2 rounded-2xl font-poppins text-xs focus:border-gray-200"
            />

            {#if errorOf('email')}
              <div class="mt-1 text-sm text-red-500">
                {errorOf('email')}
              </div>
            {/if}
          </div>

          <!-- Campo senha -->
          <div>
            <Label for="senha" class="mb-1 font-special text-white">
              SENHA:
              {id !== null ? '(DEIXE VAZIO PARA MANTER ATUAL)' : ''}
            </Label>

            <Input
              id="senha"
              type="password"
              bind:value={user.senha}
              placeholder={id === null
                ? 'Digite a senha (mínimo 6 caracteres)'
                : 'Nova senha (opcional)'}
              required={id === null}
              minlength={6}
              class="mt-0 mb-2 rounded-2xl font-poppins text-xs focus:border-gray-200"
            />

            {#if errorOf('senha')}
              <div class="mt-1 text-sm text-red-500">
                {errorOf('senha')}
              </div>
            {/if}
          </div>

          <!-- Campo perfil -->
          <div>
            <Label for="role" class="mb-1 font-special text-white">
              PERFIL DE ACESSO:
            </Label>

            <Select
              id="role"
              bind:value={user.role}
              items={roleOptions}
              class="mt-0 mb-2 font-poppins text-xs"
            />

            {#if errorOf('role')}
              <div class="mt-1 text-sm text-red-500">
                {errorOf('role')}
              </div>
            {/if}
          </div>

          <!-- Divisor administrativo -->
          <div class="mt-2 h-px w-full bg-gray-800"></div>

          <!-- Botões de ação -->
          <div class="mt-2 flex justify-end gap-4">

            <!-- Botão cancelar -->
            <Button
              type="button"
              onclick={handleCancel}
              disabled={loading}
              class="w-3xs !flex !items-center !justify-center rounded-xl bg-transparent font-special text-[1rem] text-white hover:bg-gray-800"
            >
              <ArrowLeftOutline class="mr-2 inline h-5 w-5 align-text-bottom" />
              {id === null ? 'VOLTAR' : 'CANCELAR'}
            </Button>

            <!-- Botão salvar -->
            <Button
              type="submit"
              disabled={loading}
              class="w-3xs !flex !items-center !justify-center rounded-xl bg-white font-special text-[1rem] text-black hover:bg-gray-300"
            >
              {#if id === null}
                CADASTRAR
              {:else}
                SALVAR
              {/if}
            </Button>

          </div>
        </form>
      </Card>

      <!-- Identificação do sistema -->
      <div class="mt-6 text-center">
        <span class="font-poppins text-[10px] tracking-[0.25em] text-gray-600">
          ARDONCAP · ADMINISTRAÇÃO
        </span>
      </div>

    </div>
  </div>
</div>