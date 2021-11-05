<script>
import { blur } from 'svelte/transition';
import { printable } from './stores.js';
import { onMount } from 'svelte';

let ready = false;
onMount(() => ready = true);

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
    {#if ready}
      <h1 in:blur>{name}</h1>
      {#each titles as title, index (title)}
        <h4 in:blur='{{delay: (index+1)*500}}'>{title}</h4>
      {/each}
    {/if}
    {#if printMode}
      <h3>Email: {email}</h3>
      <h3>LinkedIn: {linkedin}</h3>
      <h3>GitHub: {github}</h3>
     {/if}
  </div>
  <!-- <img
    class={imageVisible ? 'header-img' : 'hidden'}
    alt={name}
    use:lazy={{src: pic}}
  /> -->
</div>
