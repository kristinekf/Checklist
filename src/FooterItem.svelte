<script>
export let url, imageSource, altText;
</script>

<h4 class='footer-item'>
  {#if url && imageSource}
    <a
      rel='noopener noreferrer'
      target='_blank'
      href={url}
    >
      <img
        class='footer-img bright'
        alt={!!altText ? altText : ''}
        src={imageSource} />
    </a>
  {/if}
</h4>