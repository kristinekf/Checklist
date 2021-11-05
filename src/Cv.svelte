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

let paused = false;
function toggleParticles() {
  console.log(particles)
  if (particles['paused']) {
    paused = false;
    particles.play()
  } else {
    paused = true;
    particles.pause()
  }
}

console.log(particles)

import Header from './Header.svelte';
import Footer from './Footer.svelte';
import { printable } from './stores.js';

let printMode;
printable.subscribe(val => printMode = val);
const togglePrintmode = () => printable.update(val => !val)
window.onbeforeprint = () => togglePrintmode()
window.onafterprint = () => togglePrintmode()

const email = 't@tollef.xyz'
const linkedin = 'tollefj'
const github = 'ph10m'

</script>

<div class:printing={printMode} class='container'>
  <Header
    name='tollef jørgensen'
    email={email}
    linkedin={linkedin}
    github={github}
    titles={[
      'PhD Candidate, Language Technology, NTNU, DART group',
      'Computer scientist (MSc)'
    ]}
  />
  <!-- <div class="shape"></div> -->
  <div class='buttons'>
    <!-- <button class='btn-dark btn-sm m-1' on:click={toggleParticles}>{paused ? 'move!!!!' : 'stop this awful animation'}</button> -->
    <button class='btn-dark btn-sm m-1' on:click={nextStyle}>change style :)</button>
  </div>
</div>
{#if !printMode}
  <Footer
    email={email}
    linkedin={linkedin}
    github={github}
  />
{/if}
