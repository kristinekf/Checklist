<svelte:head>
    <title>Gjøremål</title>
</svelte:head>

<script>
    // store checklist in localstorage:
    // store id of checked checklist in localstorage:

    let defaultChecklist = [
        "Item 1",
        "Item 2",
        "Item 3",
        "Item 4",
        "Item 5",
    ]

    let current_checked = [];
    // localStorage.setItem("checked", JSON.stringify(current_checked))

    function updateChecked(event, index) {
        event.preventDefault()
        console.log(index)
        current_checked[index] = !current_checked[index]

        // localStorage.setItem("checked", JSON.stringify(current_checked))
    }

    
let editMode = false;
</script>

<!-- render all items in checklist bindings -->

<div class="p-3">
    <p class="x-large">Daglige gjøremål</p>

    <!-- render current_checklist: -->
    <ul>
        <!-- render for each index of defaulthcecklist -->
        {#each defaultChecklist as item, index (item)}
            <li>
                <div class="grid-custom">
                <!-- let user change item: -->
                {#if editMode}
                    <input type="text"
                        value={item}
                        on:input={(e) => {
                            console.log(e)
                            // current_checklist[index] = e.target.value
                            // localStorage.setItem("checklist", JSON.stringify(current_checklist))
                        }}
                    />
                {:else}
                    <p>{item}</p>
                {/if}
                
<!--                 <input type="checkbox"
                    checked={current_checked.includes(item)}
                    on:click={(e) => {
                        updateChecked(e, index)
                        if (current_checked.includes(item)) {
                            current_checked = current_checked.filter(i => i !== item)
                        } else {
                            current_checked.push(item)
                        }
                        // localStorage.setItem("checked", JSON.stringify(current_checked))
                    }}
                /> -->
                </div>
            </li>
        {/each}
    </ul>
    <div class="grid-box">
        <button 
            on:click={() => {
                editMode = !editMode
            }}
            class="knapp"
        >
        {#if editMode}
            Ferdig
        {:else}
            Rediger
        {/if}
        </button>
        
    </div>

</div>