<script lang="ts">
  import { Heading } from 'flowbite-svelte';
  import Menu from '../components/Menu.svelte';
  import CategoriaTable from '../components/LinksCategoria.svelte';
  import {  P, ImagePlaceholder, Skeleton, TextPlaceholder } from "flowbite-svelte";
	import LinksCategoria from '../components/LinksCategoria.svelte';
</script>

<Menu />

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    background-color: black;
    scroll-behavior: smooth;
  }
</style>


<section class="w-full h-screen text-white bg-black bg-[url('/images/background.png')] bg-no-repeat bg-cover bg-center px-[7%] flex flex-col">
    
    <div class="pt-[12%]">
        <h1 class="text-[clamp(2.5rem,8vw,5rem)] font-instrument leading-[1.1] m-0">
            <br>
            CONSUMA MELHOR, <br/>
            COMPRE CONSCIENTE
        </h1>
        
        <h2 class="mt-5 font-special text-4xl">
            Produtos bons merecem uma segunda vida.
        </h2>
    </div>

</section>

<section class="bg-black text-white py-20 mt-5" id="categorias">
  <h3 class="text-3xl font-special text-center">I. Categorias</h3>
  <br><br>
  <LinksCategoria/>
</section>
<section class="bg-black text-white py-20">
  <h3 class="text-3xl font-special text-center">II. Produtos</h3>
</section>
