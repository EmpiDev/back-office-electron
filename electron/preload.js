const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronApi", {
    ping: () => ipcRenderer.invoke("ping"),
    openFileDialog: () => ipcRenderer.invoke("dialog:openFile"),
    notifyJokeAdded: (joke) => ipcRenderer.invoke('jokes:notify-added', joke),

    // Users
    getUsers: () => ipcRenderer.invoke('users:get-all'),
    createUser: (user) => ipcRenderer.invoke('users:create', user),
    deleteUser: (user) => ipcRenderer.invoke('users:delete', user),

    // Services
    getServices: () => ipcRenderer.invoke('services:get-all'),
    createService: (service) => ipcRenderer.invoke('services:create', service),
    deleteService: (id) => ipcRenderer.invoke('services:delete', id),

    // Products
    getProducts: () => ipcRenderer.invoke('products:get-all'),
    createProduct: (product) => ipcRenderer.invoke('products:create', product),
    deleteProduct: (id) => ipcRenderer.invoke('products:delete', id),
});
