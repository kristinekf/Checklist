<script>
import Checklist from './routes/Checklist.svelte'
import Home from './Home.svelte'

const routeMap = {
  "/": Home,
  "/list": Checklist,
};

const hash = location.hash.slice(1) || "/";
let page = routeMap[hash];

function changingRoute() {
  const hash = location.hash.slice(1)
  console.log(hash)
  page = routeMap[hash] || Home
  console.log(page)
}

</script>

<svelte:window on:hashchange={changingRoute} />

<main> <svelte:component this={page} /> </main>