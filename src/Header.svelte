<script>
import { fly } from 'svelte/transition';
import { printable } from './stores.js';

export let name, titles, email, linkedin, github;

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

let printMode;
printable.subscribe(value => printMode = value);
</script>

<div class='header'>
  <div class='header-text'>
    <h1>{name}</h1>
    {#if printMode}
      <h3>{email}</h3>
      <h3>LinkedIn: {linkedin}</h3>
      <h3>GitHub: {github}</h3>
    {:else}
      {#each titles as title, index (title)}
        <h3 in:fly='{{delay: (index+1)*300}}'>{title}</h3>
      {/each}
     {/if}
  </div>
  <!-- <img
    class={imageVisible ? 'header-img' : 'hidden'}
    alt={name}
    use:lazy={{src: pic}}
  /> -->
</div>
