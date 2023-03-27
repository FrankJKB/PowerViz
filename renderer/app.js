// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { ipcRenderer } = require("electron")
const items = require('./items.js')

// Dom Nodes
let showModal = document.getElementById('show-modal'),
    closeModal = document.getElementById('close-modal'),
    modal = document.getElementById('modal'),
    addItem = document.getElementById('add-item'),
    itemUrl = document.getElementById('url'),
    search = document.getElementById('search')

// Open modal from menu
ipcRenderer.on('menu-show-modal', () => {
    showModal.click()
})

// Open selected item from menu
ipcRenderer.on('menu-open-item', () => {
    items.open()
})

// Open selected item from menu in native browser
ipcRenderer.on('menu-open-item-native', () => {
    items.openNative()
})

// Search
ipcRenderer.on('menu-focus-search', () => {
    search.focus()
})

// Delete selected item from menu
ipcRenderer.on('menu-delete-item', () => {
    let selectedItem = items.getSelectedIem()
    items.delete(selectedItem.index)
})

// Filter items with search
search.addEventListener('keyup', e => {

    // Loop items
    Array.from(document.getElementsByClassName('read-item')).forEach(item => {

        // Hide items that don't match search value
        let hasMatch = item.innerHTML.toLowerCase().includes(search.value)
        item.style.display = hasMatch ? 'flex' : 'none'
    })
})

// Navigate item selection with arrows
document.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown'){
        items.changeSelection(e.key)
    }
})

// Disable and Enable modal buttons
const toggleModalButtons = () => {
    if (addItem.disabled === true) {
        addItem.disabled = false
        addItem.style.opacity = 1
        addItem.innerText = 'Add Item'
        closeModal.style.display = 'inline'
    } else {
        addItem.disabled = true
        addItem.style.opacity = 0.5
        addItem.innerText = 'Adding...'
        closeModal.style.display = 'none'
    }
}

// Show modal
showModal.addEventListener('click', e => {
    modal.style.display = 'flex'
    itemUrl.focus()
})

// Hide modal
closeModal.addEventListener('click', e => {
    modal.style.display = 'none'
})

// Handle new item
addItem.addEventListener('click', e => {
    // Check if a url exists
    if (itemUrl.value) {
        // Send new item url to main process
        ipcRenderer.send('new-item', itemUrl.value)
        // Disable buttons
        toggleModalButtons()
    }
})

// Listen for new item from main process
ipcRenderer.on('new-item-success', (e, newItem) => {
    // Add new item to items
    items.addItem(newItem, true)

    // Enable buttons
    toggleModalButtons()

    // Hide modal and clear value
    modal.style.display = 'none'
    itemUrl.value = ''
})

// Listen for keyboard submit
itemUrl.addEventListener('keyup', e => {
    if (e.key === 'Enter') addItem.click()
})
