<script>
import { onMount } from 'svelte';

let ready = false;
onMount(() => ready = true);

export let name, titles;

// https://stackoverflow.com/a/50049255
const loaded = new Map();
let imageVisible = false;
const lazy = (node, data) => {
  if (loaded.has(data.src)) {
    node.setAttribute('src', data.src);
  } else {
    const img = new Image();
    img.src = data.src;
    img.onload = () => {
      loaded.set(data.src, img);
      node.setAttribute('src', data.src); 
      imageVisible = true;
    };
  }
  return {
    destroy(){} // noop
  };
}

</script>

<div class='header'>
  <div class='header-text'>
    {#if ready}
      <p class="x-large">{name}</p>
      {#each titles as title, index (title)}
        <!-- <h4 in:blur='{{delay: (index+1)*500}}'>- {title}</h4> -->
        <p class="medium">{title}</p>
      {/each}
    {/if}
  </div>
  <!-- <img
    class={imageVisible ? 'header-img' : 'hidden'}
    alt={name}
    use:lazy={{src: pic}}
  /> -->
</div>
