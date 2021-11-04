<script>
import { fly, scale } from 'svelte/transition';
import { printable } from './stores.js';

export let title, year, items;

let clicked = false;
let printMode;
printable.subscribe(value => printMode = value);
</script>

<div class='cv-item'>
  <div class='cv-item-header disable-select' on:click={() => clicked = !clicked}>
    <h3>
      {#if !printMode}
        <i class={`fa fa-chevron-${clicked ? 'up' : 'down'}`}></i>
      {/if}
      {title}
    </h3>
    <h3>{year}</h3>
  </div>
  <ul class='cv-item-content'>
    {#if clicked || printMode}
    {#each items as item, index (item)}
      <li
        in:scale="{{ delay: 20*index }}"
        out:scale="{{ delay: 20*items.length - 20*index}}"
        >{item}</li>
    {/each}
    {/if}
  </ul>
</div>
