<script lang="ts">
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Heading, button} from "flowbite-svelte";
  import { onMount } from "svelte";
  import { logout, getCurrentUser, getToken, type User } from "$lib/auth";
  import { goto } from "$app/navigation";
  import { ArrowRightToBracketOutline } from "flowbite-svelte-icons";
  import { page } from "$app/stores";

  let user: User | null = null;
  let hasToken = false;
  let loadingUser = false;
  let authRequestId = 0;

  // Verifica token sincronamente (instantâneo)
  async function updateAuthStatus() {
    hasToken = getToken() !== null;

    if (!hasToken) {
      user = null;
      loadingUser = false;
      return;
    }

    if (user || loadingUser) {
      return;
    }

    loadingUser = true;
    const requestId = ++authRequestId;

    try {
      const userData = await getCurrentUser();
      if (requestId !== authRequestId) {
        return;
      }
      user = userData;
      hasToken = userData !== null;
    } catch {
      if (requestId !== requestId) {
        return;
      }
      user = null;
      hasToken = false;
    } finally {
      if (requestId === authRequestId) {
        loadingUser = false;
      }
    }
  }

  // Reativo à mudança de página
  $: if ($page.url.pathname) {
    void updateAuthStatus();
  }

  onMount(() => {
    void updateAuthStatus();
  });

  // função para logout (só apaga o token)
  async function handleLogout() {
    try {
      authRequestId += 1;
      await logout();
      user = null;
      hasToken = false;
      loadingUser = false;
      goto("/login");
    } catch (error) {
      console.error("Erro no logout: ", error);
    }
  }
</script>

<div class="relative px-8">
  <Navbar class="fixed start-0 top-0 z-20 w-full px-2 py-2.5 sm:px-4">
    <NavBrand href="/">
      <img src="/images/AlfredArdoncap.svg" class="me-3 h-6 sm:h-9" alt="Logo aleatória" />
      <Heading class="self-center text-xl font-light font-poppins whitespace-nowrap text-white">ARDONCAP</Heading>
    </NavBrand>
    <NavHamburger class="text-white hover:bg-black focus:ring-black"/>
    <NavUl>
      <!-- MODIFICADO: max-md:text-black força a cor preta apenas em telas de celular/tablet -->
      <NavLi href="/" nonActiveClass="text-lg font-light font-poppins px-4 py-2 text-white hover:text-gray-800 transition-colors rounded-lg">Início</NavLi>
      <NavLi href="/#categorias" nonActiveClass="text-lg font-light font-poppins px-4 py-2 text-white max-md:text-black hover:text-gray-600 focus:text-gray-600 transition-colors rounded-lg">Categorias</NavLi>
      <NavLi href="/about" nonActiveClass="text-lg font-light font-poppins px-4 py-2 text-white max-md:text-black hover:text-gray-600 focus:text-gray-600 transition-colors rounded-lg">Sobre</NavLi>
      {#if hasToken}
        {#if user}
          <!-- se existir usuário é porque conseguiu logar-->
          {#if user.role === "admin"}
            <!-- só exibe menu usuários para admin-->
            <NavLi href="/painel" nonActiveClass="text-lg font-light font-poppins px-4 py-2 text-white max-md:text-black hover:text-gray-600 focus:text-gray-600 transition-colors rounded-lg">Painel</NavLi>
          {/if}
          <NavLi>
            <div class="flex items-center">
              <a href="/profile"><span class="text-white font-light font-poppins px-4 py-2 max-md:text-black">Olá, {user.login}</span></a>
              <!-- svelte-ignore component_name_lowercase -->
              <button class="ml-2 px-3 py-1 bg-red-600 hover:bg-red-800 text-white rounded text-sm flex items-center gap-1" on:click={handleLogout}>
                <ArrowRightToBracketOutline class="w-4 h-4" /> Sair
              </button>
            </div>
          </NavLi>
        {:else if loadingUser}
          <NavLi class="text-lg font-bold px-4 py-2 text-white max-md:text-black">Carregando...</NavLi>
        {:else}
          <NavLi href="/login" class="text-lg font-light font-poppins px-4 py-2 text-white max-md:text-black hover:text-gray-300 hover:bg-gray-700 focus:text-gray-400 focus:bg-gray-700 transition-colors rounded-lg">Login</NavLi>
        {/if}
      {:else}
        <!-- se não tem token, exibe botão de login-->
        <NavLi href="/login" nonActiveClass="text-lg font-light font-poppins px-4 py-2 text-white max-md:text-black hover:text-red-600 focus:text-red-600 transition-colors rounded-lg">Login</NavLi>
      {/if}
    </NavUl>
  </Navbar>
</div>
