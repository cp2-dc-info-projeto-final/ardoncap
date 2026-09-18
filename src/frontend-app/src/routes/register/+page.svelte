<script lang="ts">
	import UserFormPublic from '../../components/UserFormPublic.svelte';
</script>

<!-- LADO DIREITO -->
<div class="hidden md:flex items-center justify-center p-6">
	<div class="w-full max-w-sm aspect-[3/4] overflow-hidden rounded-2xl">
		<img 
			src="../images/Cadastro.jpeg" 
			alt="Login visual" 
			class="w-full h-full object-cover object-center"
		/>
	</div>
	<UserFormPublic />
</div>

