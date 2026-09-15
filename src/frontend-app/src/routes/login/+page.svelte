<script lang="ts">
  import { Card, Button, Input, Label, Alert, Img } from "flowbite-svelte";
  import { goto } from "$app/navigation";
  import { login as authLogin } from "$lib/auth";
  
  let login = '';
  let password = '';
  let loading = false;
  let error = '';

  async function handleLogin() {
    if (!login || !password) {
      error = 'Por favor, preencha todos os campos';
      return;
    }

    loading = true;
    error = '';

    try {
      const result = await authLogin({ login, password });
      
      if (result.success) {
        await goto('/');
      } else {
        error = result.message || 'Credenciais inválidas';
      }
    } catch (err) {
      error = 'Erro interno do servidor';
      console.error('Erro no login:', err);
    } finally {
      loading = false;
    }
  }


</script>

<svelte:head>
  <title>Login - Ardoncap</title>
</svelte:head>

<div class="w-full min-h-screen pt-16 grid grid-cols-1 md:grid-cols-2 bg-black text-white">
  <div class="h-screen flex flex-col items-center justify-center bg-black p-4 md:p-12">
    <div class="w-full max-w-sm">
      
      <Card class="p-6 w-full bg-black border-0">
        <form on:submit|preventDefault={handleLogin} class="space-y-6">
              <h2 class="text-center text-4xl font-instrument text-white mb-6">
                LOGIN
              </h2>
              <div class="mt-20 mb-14">
                <div>
                <Label for="login" class="mb-1 text-white font-special">LOGIN:</Label>
                <Input
                  class= "focus:border-gray-200 font-poppins text-xs mt-0 mb-2 rounded-2xl"
                  id="login"
                  type="text"
                  bind:value={login}
                  placeholder="Digite seu login"
                  required
                  />
              </div>

              <div>
                <Label for="password" class="mb-1 text-white font-special">SENHA:</Label>
                <Input
                  class= "focus:border-gray-200 font-poppins text-xs mt-0 mb-2 rounded-2xl"
                  id="password"
                  type="password"
                  bind:value={password}
                  placeholder="Digite sua senha"
                  required
                />
              </div>
            </div>

            {#if error}
              <Alert color="red" class="mb-4">
                {error}
              </Alert>
            {/if}
            <div class="flex justify-center">
              <Button 
              type="submit"
              class="w-3xs bg-white text-[1.1rem] hover:bg-gray-300 text-black font-special rounded-none" 
              disabled={loading}>
              {loading ? 'Entrando...' : 'ENTRAR'}
              </Button>
            </div>
            <div class="flex justify-center">
              <a href="/register" class="text-white hover:text-gray-300 hover:underline font-special">Não tem uma conta? Cadastre-se agora</a>
            </div>
        </form>
      </Card>
    </div>
  </div>
    <!-- LADO DIREITO: Colado cirurgicamente no formulário -->
  <div class="hidden md:flex w-full items-center justify-start p-6 md:py-12 md:pl-0">
    <div class="w-full max-w-sm aspect-[3/4] overflow-hidden rounded-2xl">
      <img 
        src="../images/Login.jpeg" 
        alt="Login visual" 
        class="w-full h-full object-cover object-center"
      />
    </div>
  </div>
  
</div>