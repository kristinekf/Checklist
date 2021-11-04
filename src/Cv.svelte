<script>
import Header from './Header.svelte';
import Footer from './Footer.svelte';
import Content from './Content.svelte';
import { printable } from './stores.js';

let profilePic = './Images/profile.png';

let printMode;
printable.subscribe(val => printMode = val);
const togglePrintmode = () => printable.update(val => !val)
window.onbeforeprint = () => togglePrintmode()
window.onafterprint = () => togglePrintmode()

const email = 'tollefj@gmail.com'
const linkedin = 'tollefj'
const github = 'ph10m'

</script>

<div class:printing={printMode} class='container'>
  <Header
    name='Tollef Jørgensen'
    email={email}
    linkedin={linkedin}
    github={github}
    pic={profilePic}
    titles={[
      'comp. sci, 5th year, ntnu',
      "master's in ai/nlp",
      'part-time developer at mito.ai',
    ]}
  />
  <Content />
</div>
{#if !printMode}
  <Footer
    email={email}
    linkedin={linkedin}
    github={github}
  />
{/if}
