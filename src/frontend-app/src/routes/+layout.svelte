<script lang="ts">
	import '../app.css';
	import Menu from '../components/Menu.svelte';
	let { children } = $props();
</script>

<main>
	<div class="flex items-start gap-4">
		<Menu />
	</div>
	<div class="flex flex-col items-center justify-center min-h-screen w-full">
		{@render children()}
	</div>
</main>
