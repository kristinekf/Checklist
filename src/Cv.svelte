<script>
import Header from './Header.svelte';
import Footer from './Footer.svelte';
import { printable } from './stores.js';

let profilePic = './Images/profile.jpg';

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
    name='Tollef Jørgensen'
    email={email}
    linkedin={linkedin}
    github={github}
    pic={profilePic}
    titles={[
      'PhD Candidate, NTNU, Language Technology (DART group)',
      'Computer scientist (MSc)'
    ]}
  />
  <!-- <div class="shape"></div> -->
</div>
{#if !printMode}
  <Footer
    email={email}
    linkedin={linkedin}
    github={github}
  />
{/if}
