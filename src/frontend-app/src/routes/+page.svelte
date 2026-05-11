<script lang="ts">
  import { Heading } from 'flowbite-svelte';
  import Menu from '../components/Menu.svelte';
  import {  P, ImagePlaceholder, Skeleton, TextPlaceholder } from "flowbite-svelte";
</script>

<Menu />

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    background-color: black;
  }
</style>


<section class="w-full h-screen text-white bg-black bg-[url('/images/FUNDO.jpeg')] bg-no-repeat bg-cover bg-center px-[8%] flex flex-col">
    
    <div class="pt-[12%]">
        <h1 class="text-[clamp(2.5rem,8vw,5rem)] font-['Instrument_Serif'] leading-[1.1] m-0">
            CONSUMA MELHOR, <br/>
            COMPRE CONSCIENTE
        </h1>
        
        <h2 class="font-['Special_Elite'] tracking-[0.1em] mt-6 font-light text-lg">
            Produtos bons merecem uma segunda vida.
        </h2>
    </div>

</section>

<section class="min-h-screen bg-black text-white px-[8%] py-20">
    <h3 class="text-4xl font-['Instrument_Serif'] mb-10">Categorias</h3>
</section>
