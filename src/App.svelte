<script>
import {opts_normal, opts_geom, opts_fireworks} from './particles.js'
import Checklist from './routes/Checklist.svelte'
import NotFound from './routes/NotFound.svelte'
import Home from './Home.svelte'

const routeMap = {
  "/": Home,
  "/list": Checklist,
};

let page = routeMap[location.hash.slice(1)];

function changingRoute() {
  const hash = location.hash.slice(1)
  console.log(hash)
  page = routeMap[hash] || Home
  console.log(page)
}

</script>

<svelte:window on:hashchange={changingRoute} />

<main> <svelte:component this={page} /> </main>