<script>
import {opts_geom, opts_normal, opts_fireworks} from './particles.js'

const opts = [opts_geom, opts_normal, opts_fireworks]
let opts_idx = 0

function load() {
  tsParticles.load("tsparticles", opts[opts_idx]);
  return tsParticles.domItem(0);
}

let particles = load();
console.log(particles)


function nextStyle() {
  const idx = opts_idx += 1
  opts_idx = idx % opts.length
  console.log(opts_idx)
  particles = load()
}

console.log(particles)

import Header from './Header.svelte';
import Footer from './Footer.svelte';
import { printable } from './stores.js';

let printMode;
printable.subscribe(val => printMode = val);
const togglePrintmode = () => printable.update(val => !val)

window.onbeforeprint = () => {
  particles.stop()
  togglePrintmode()
}
window.onafterprint = () => {
  particles.start()
  togglePrintmode()
}

const email = 't@tollef.xyz'
const linkedin = 'tollefj'
const github = 'ph10m'

</script>

<div class:printing={printMode} class='container'>
  <Header
    name='Tollef Jørgensen'
    email={email}
    linkedin={linkedin}
    github={github}
    titles={[
      'PhD Candidate, Language Technology, NTNU, DART group',
      'Computer scientist (MSc)'
    ]}
  />
  <!-- <div class="shape"></div> -->
  {#if !printMode}
    <div class='buttons'>
      <!-- <button class='btn-dark btn-sm m-1' on:click={toggleParticles}>toggle</button> -->
      <button class='btn-dark btn-sm m-1' on:click={nextStyle}>change style :)</button>
    </div>
  {/if}
</div>
{#if !printMode}
  <Footer
    email={email}
    linkedin={linkedin}
    github={github}
  />
{/if}
