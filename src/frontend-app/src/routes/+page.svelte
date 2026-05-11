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
    scroll-behavior: smooth;
  }
</style>


<section class="w-full h-screen text-white bg-black bg-[url('/images/FUNDO.jpeg')] bg-no-repeat bg-cover bg-center px-[7%] flex flex-col">
    
    <div class="pt-[12%]">
        <h1 class="text-[clamp(2.5rem,8vw,5rem)] font-['InstrumentSerif'] leading-[1.1] tracking-[2%] m-0 font-bold">
            <br>
            CONSUMA MELHOR, <br/>
            COMPRE CONSCIENTE
        </h1>
        
        <h2 class="font-['Special_Elite'] tracking-[20%] mt-5 font-light text-4xl">
            Produtos bons merecem uma segunda vida.
        </h2>
    </div>

</section>

<section class="min-h-screen bg-black text-white px-[8%] py-20 mt-5" id="categorias">
<br><br>
    <h3 class="text-4xl font-['Instrument_Serif'] mb-10">Categorias</h3>
</section>
