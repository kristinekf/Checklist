<script>
import {opts_normal, opts_geom, opts_fireworks} from './particles.js'
import Todos from './routes/todos.svelte'
import Home from './Home.svelte'
import { Router, Route, Link } from 'svelte-routing';

let url = ""

</script>

<Router url="{url}">
  <!-- <nav>
    <Link to="/">Home</Link>
    <Link to="about">About</Link>
    <Link to="blog">Blog</Link>
  </nav> -->
  <div class="container">
    <Route path="checklist" component="{Todos}" />
    <Route path="/"><Home /></Route>
  </div>
</Router>