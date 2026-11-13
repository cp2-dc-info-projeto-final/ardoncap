<script lang="ts">
    import Profile from '../../../components/Profile.svelte';
    import { page } from '$app/stores';
    import { get } from 'svelte/store';
    const { id } = get(page).params;
</script>

{#if id}
    <div class="mt-27">
        <Profile {id} />
    </div>
{/if}

