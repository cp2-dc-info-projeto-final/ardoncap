
<script lang="ts">
    import { onMount } from 'svelte';
    import api from '$lib/api';

    export let produtoId: number | string;
    export let isOwner = false;

    import { getCurrentUser } from '$lib/auth';
    import type { User } from '$lib/auth';

    let authUser: User | null = null;
    let isAdmin = false;

    interface Avaliacao {
        id: number;
        nota: number;
        comentario: string | null;
        data_avaliacao: string;
        id_usuario: number;
        usuario: string;
    }

    let avaliacoes: Avaliacao[] = [];
    let minhaAvaliacao: Avaliacao | null = null;

    let media = 0;
    let total = 0;

    let podeAvaliar = false;
    let jaAvaliou = false;

    let nota = 0;
    let comentario = '';

    let editando = false;
    let loading = true;
    let enviando = false;
    let error = '';
    let mensagem = '';

    async function carregarAvaliacoes() {
        loading = true;
        error = '';
        console.log('CARREGANDO AVALIAÇÕES');
        console.log('ID DO PRODUTO:', produtoId);

        try {
            const respostas = await Promise.all([
                api.get(`/avaliacoes/produto/${produtoId}`),
                api.get(`/avaliacoes/produto/${produtoId}/minha`),
                api.get(`/avaliacoes/produto/${produtoId}/permissao`)
            ]);

            const dados = respostas[0].data.data;

            avaliacoes = dados.avaliacoes;
            media = Number(dados.media);
            total = Number(dados.total);

            minhaAvaliacao = respostas[1].data.data;

            podeAvaliar = respostas[2].data.data.pode_avaliar;
            jaAvaliou = respostas[2].data.data.ja_avaliou;

            if (minhaAvaliacao) {
                nota = minhaAvaliacao.nota;
                comentario = minhaAvaliacao.comentario || '';
            }

        } catch (e: any) {
            console.error('ERRO:', e);
            console.error('STATUS:', e.response?.status);
            console.error('DADOS:', e.response?.data);

            error = e.response?.data?.message ||
                'Erro ao carregar as avaliações.';
        } finally {
            loading = false;
        }
    }

    onMount(async () => {
    try {
        authUser = await getCurrentUser();
        isAdmin = authUser?.role === 'admin';

        await carregarAvaliacoes();

    } catch (error) {
        console.error('Erro ao inicializar avaliações:', error);
    }
    });

    function selecionarNota(valor: number) {
        nota = valor;
    }

    function quantidadeNotas(valor: number) {
        return avaliacoes.filter(a => a.nota === valor).length;
    }

    function formatarData(data: string) {
        return new Date(data).toLocaleDateString('pt-BR');
    }

    async function salvarAvaliacao() {
        if (nota < 1 || nota > 5) {
            error = 'Selecione uma nota de 1 a 5 estrelas.';
            return;
        }

        enviando = true;
        error = '';
        mensagem = '';

        try {
            if (editando && minhaAvaliacao) {
                await api.put(`/avaliacoes/${minhaAvaliacao.id}`, {
                    nota,
                    comentario
                });

                mensagem = 'Avaliação atualizada com sucesso!';
            } else {
                await api.post(`/avaliacoes/produto/${produtoId}`, {
                    nota,
                    comentario
                });

                mensagem = 'Avaliação enviada com sucesso!';
            }

            editando = false;

            await carregarAvaliacoes();

        } catch (e: any) {
            error = e.response?.data?.message ||
                'Não foi possível salvar sua avaliação.';
        } finally {
            enviando = false;
        }
    }

    async function excluirAvaliacaoADM(avaliacaoId: number) {
    if (!isAdmin) return;

    const confirmar = confirm(
        'Tem certeza que deseja excluir esta avaliação?'
    );

    if (!confirmar) return;

    try {
        await api.delete(`/avaliacoes/${avaliacaoId}`);

        // Atualiza a lista sem precisar recarregar a página
        avaliacoes = avaliacoes.filter(
            (avaliacao) => avaliacao.id !== avaliacaoId
        );

        alert('Avaliação removida com sucesso!');

    } catch (error: any) {
        alert(
            error.response?.data?.message ||
            'Erro ao excluir avaliação.'
        );
    }
    }

    async function excluirAvaliacao() {
        if (!minhaAvaliacao) return;

        const confirmar = confirm(
            'Deseja realmente excluir sua avaliação?'
        );

        if (!confirmar) return;

        try {
            await api.delete(`/avaliacoes/${minhaAvaliacao.id}`);

            minhaAvaliacao = null;
            nota = 0;
            comentario = '';
            editando = false;
            mensagem = 'Avaliação excluída com sucesso!';

            await carregarAvaliacoes();

        } catch (e: any) {
            error = e.response?.data?.message ||
                'Erro ao excluir avaliação.';
        }
    }

    function cancelarEdicao() {
        editando = false;

        if (minhaAvaliacao) {
            nota = minhaAvaliacao.nota;
            comentario = minhaAvaliacao.comentario || '';
        } else {
            nota = 0;
            comentario = '';
        }

        error = '';
    }
</script>

<section class="mt-20 border-t border-neutral-800 pt-12">

    <!-- Título -->
    <div class="mb-10">
        <span class="font-special text-xs uppercase tracking-[0.3em] text-neutral-500">
            EXPERIÊNCIA DOS CLIENTES
        </span>

        <h2 class="mt-3 font-instrument text-4xl uppercase text-white">
            Avaliações
        </h2>
    </div>

    {#if loading}

        <p class="py-10 text-center font-poppins text-sm text-neutral-400">
            Carregando avaliações...
        </p>

    {:else}

        <!-- Resumo das avaliações -->
        <div class="grid grid-cols-1 gap-10 border-b border-neutral-800 pb-12 md:grid-cols-2">

            <div class="flex flex-col justify-center">
                <p class="font-instrument text-7xl text-white">
                    {media.toFixed(1)}
                </p>

                <div class="mt-3 flex gap-1 text-xl text-white">
                    {#each [1, 2, 3, 4, 5] as estrela}
                        <span class:text-neutral-700={estrela > Math.round(media)}>
                            ★
                        </span>
                    {/each}
                </div>

                <p class="mt-3 font-poppins text-sm text-neutral-500">
                    {total} {total === 1 ? 'avaliação' : 'avaliações'}
                </p>
            </div>

            <!-- Distribuição das notas -->
            <div class="flex flex-col justify-center gap-3">

                {#each [5, 4, 3, 2, 1] as estrelas}
                    <div class="flex items-center gap-3">

                        <span class="w-8 font-poppins text-xs text-neutral-400">
                            {estrelas} ★
                        </span>

                        <div class="h-2 flex-1 overflow-hidden bg-neutral-800">
                            <div
                                class="h-full bg-white"
                                style={`width: ${total ? (quantidadeNotas(estrelas) / total) * 100 : 0}%`}
                            ></div>
                        </div>

                        <span class="w-6 text-right font-poppins text-xs text-neutral-500">
                            {quantidadeNotas(estrelas)}
                        </span>

                    </div>
                {/each}

            </div>
        </div>

        <!-- Mensagens -->
        {#if mensagem}
            <p class="my-5 font-poppins text-sm text-neutral-300">
                {mensagem}
            </p>
        {/if}

        {#if error}
            <p class="my-5 font-poppins text-sm text-red-400">
                {error}
            </p>
        {/if}

        <!-- Formulário de avaliação -->
        {#if podeAvaliar && (!jaAvaliou || editando)}

            <div class="my-12 border-b border-neutral-800 pb-12">

                <h3 class="mb-6 font-instrument text-2xl uppercase text-white">
                    {editando ? 'Editar avaliação' : 'Avalie este produto'}
                </h3>

                <p class="mb-3 font-special text-xs tracking-widest text-neutral-500">
                    SUA NOTA
                </p>

                <div class="mb-6 flex gap-2">
                    {#each [1, 2, 3, 4, 5] as estrela}
                        <button
                            type="button"
                            class={`text-3xl transition-colors ${
                                estrela <= nota
                                    ? 'text-white'
                                    : 'text-neutral-700 hover:text-neutral-400'
                            }`}
                            onclick={() => selecionarNota(estrela)}
                            aria-label={`Avaliar com ${estrela} estrelas`}
                        >
                            ★
                        </button>
                    {/each}
                </div>

                <label
                    for="comentario-avaliacao"
                    class="mb-3 block font-special text-xs tracking-widest text-neutral-500"
                >
                    SEU COMENTÁRIO
                </label>

                <textarea
                    id="comentario-avaliacao"
                    bind:value={comentario}
                    rows="4"
                    maxlength="1000"
                    placeholder="Conte sua experiência com o produto..."
                    class="w-full resize-none border border-neutral-700 bg-transparent p-4 font-poppins text-sm text-white placeholder:text-neutral-600 focus:border-white focus:outline-none"
                ></textarea>

                <div class="mt-5 flex flex-col gap-3 sm:flex-row">

                    <button
                        type="button"
                        disabled={enviando}
                        onclick={salvarAvaliacao}
                        class="border border-white bg-white px-8 py-3 font-special text-xs tracking-widest text-black transition hover:bg-neutral-300 disabled:opacity-50"
                    >
                        {enviando
                            ? 'ENVIANDO...'
                            : editando
                                ? 'SALVAR ALTERAÇÕES'
                                : 'ENVIAR AVALIAÇÃO'}
                    </button>

                    {#if editando}
                        <button
                            type="button"
                            onclick={cancelarEdicao}
                            class="border border-neutral-700 px-8 py-3 font-special text-xs tracking-widest text-white hover:border-white"
                        >
                            CANCELAR
                        </button>
                    {/if}

                </div>
            </div>

        {:else if !isOwner && !podeAvaliar && !jaAvaliou}
            <div class="my-12 border-b border-neutral-800 pb-12">
                <p class="font-poppins text-sm text-neutral-500">
                    Você poderá avaliar este produto após o recebimento da sua compra.
                </p>
            </div>
        {/if}

        <!-- Minha avaliação -->
        {#if minhaAvaliacao && !editando}

            <div class="mb-10 border border-neutral-700 p-6">

                <div class="flex flex-wrap items-center justify-between gap-4">

                    <div>
                        <span class="font-special text-xs tracking-widest text-neutral-400">
                            SUA AVALIAÇÃO
                        </span>

                        <div class="mt-2 flex gap-1 text-lg text-white">
                            {#each [1, 2, 3, 4, 5] as estrela}
                                <span class:text-neutral-700={estrela > minhaAvaliacao.nota}>
                                    ★
                                </span>
                            {/each}
                        </div>
                    </div>

                    <div class="flex gap-4">
                        <button
                            type="button"
                            onclick={() => editando = true}
                            class="font-special text-xs tracking-widest text-white hover:text-neutral-400"
                        >
                            EDITAR
                        </button>

                        <button
                            type="button"
                            onclick={excluirAvaliacao}
                            class="font-special text-xs tracking-widest text-neutral-400 hover:text-white"
                        >
                            EXCLUIR
                        </button>
                    </div>

                </div>

                {#if minhaAvaliacao.comentario}
                    <p class="mt-5 font-poppins text-sm leading-7 text-neutral-300">
                        {minhaAvaliacao.comentario}
                    </p>
                {/if}

                <p class="mt-4 font-poppins text-xs text-neutral-600">
                    {formatarData(minhaAvaliacao.data_avaliacao)}
                </p>

            </div>

        {/if}

        <!-- Lista de avaliações -->
<div class="space-y-8">

    {#if avaliacoes.length === 0}

        <p class="py-10 text-center font-poppins text-sm text-neutral-500">
            Este produto ainda não possui avaliações.
        </p>

    {:else}

        {#each avaliacoes as avaliacao}
            <article class="border-b border-neutral-800 pb-8">

                <div class="flex flex-wrap items-center justify-between gap-3">

                    <div>
                        <h4 class="font-poppins text-sm font-semibold text-white">
                            {avaliacao.usuario}
                        </h4>

                        <div class="mt-2 flex gap-1 text-sm text-white">
                            {#each [1, 2, 3, 4, 5] as estrela}
                                <span class:text-neutral-700={estrela > avaliacao.nota}>
                                    ★
                                </span>
                            {/each}
                        </div>
                    </div>

                    <span class="font-poppins text-xs text-neutral-600">
                        {formatarData(avaliacao.data_avaliacao)}
                    </span>

                </div>

                {#if avaliacao.comentario}
                    <p class="mt-5 font-poppins text-sm leading-7 text-neutral-300">
                        {avaliacao.comentario}
                    </p>
                {:else}
                    <p class="mt-5 font-poppins text-xs italic text-neutral-600">
                        Avaliação sem comentário.
                    </p>
                {/if}

                {#if isAdmin}
                    <div class="mt-4 flex justify-end">
                        <button
                            type="button"
                            onclick={() => excluirAvaliacaoADM(avaliacao.id)}
                            class="font-special text-xs tracking-widest text-neutral-500 hover:text-white transition-colors"
                        >
                            EXCLUIR
                        </button>
                    </div>
                {/if}

            </article>
        {/each}

    {/if}

</div>

    {/if}

</section>