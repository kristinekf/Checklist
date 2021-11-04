<script>
import {scale} from 'svelte/transition';
import FooterItem from './FooterItem.svelte';
import copy from 'copy-to-clipboard';
export let email, linkedin, github;
let png_linkedin = './Images/LI.png';
let png_github = './Images/Github.png';
let png_click = './Images/cursor.png';
let emailHidden = true;

const showAndCopyEmail = () => {
  copy(email)
  emailHidden = false;
  setTimeout(() => {
    emailHidden = true
  }, 2000)
}
</script>

<div class='footer bg-dark'>
  {#if emailHidden}
    <div in:scale='{{duration: 100}}' on:click={showAndCopyEmail} class='footer-container cursor'>
      <h4 in:scale>copy email</h4>
      <img
        class='footer-img tiny-img scale-up'
        alt=''
        src={png_click}
      >
    </div>
  {:else}
    <div in:scale='{{duration:100}}' on:click={showAndCopyEmail} class='footer-container'>
      <h4>email copied to clipboard!</h4>
    </div>
  {/if}
  <div class='footer-container'>
    <FooterItem
      url={`https://linkedin.com/in/${linkedin}`}
      imageSource={png_linkedin}
      altText='linkedin'
    />
    <FooterItem
      url={`https://github.com/${github}`}
      imageSource={png_github}
      altText='github'
    />
  </div>
</div>

