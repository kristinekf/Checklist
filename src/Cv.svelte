<script>
import {opts_normal, opts_geom, opts_fireworks} from './particles.js'
import { Router, Route, Link } from 'svelte-routing';

const opts = [opts_normal, opts_geom, opts_fireworks]
let opts_idx = 1

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

import Header from './Header.svelte';
import Footer from './Footer.svelte';

const email = 't@tollef.xyz'
const linkedin = 'tollefj'
const github = 'tollefj'

</script>

<div class:true={"ok"}>
  <Header
    name='Tollef Jørgensen'
    email={email}
    linkedin={linkedin}
    github={github}
    titles={[
      'PhD Candidate, Language Technology [NTNU - DART group]',
      '(also certified computer nerd)'
    ]}
  />
  <!-- <div class="shape"></div> -->
</div>
<!-- <div class='buttons'>
  <button class='btn-dark btn-sm m-1' on:click={nextStyle}>change style :)</button>
</div> -->
<Footer
  email={email}
  linkedin={linkedin}
  github={github}
/>
