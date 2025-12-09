const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronApi", {
    ping: () => ipcRenderer.invoke("ping"),
    openFileDialog: () => ipcRenderer.invoke("dialog:openFile"),
    notifyJokeAdded: (joke) => ipcRenderer.invoke('jokes:notify-added', joke),

    // Users
    getUsers: () => ipcRenderer.invoke('users:get-all'),
    createUser: (user) => ipcRenderer.invoke('users:create', user),
    updateUser: (id, user) => ipcRenderer.invoke('users:update', id, user),
    deleteUser: (user) => ipcRenderer.invoke('users:delete', user),

    // Services
    getServices: () => ipcRenderer.invoke('services:get-all'),
    createService: (service) => ipcRenderer.invoke('services:create', service),
    updateService: (id, service) => ipcRenderer.invoke('services:update', id, service),
    deleteService: (id) => ipcRenderer.invoke('services:delete', id),
    getServiceByTag: (tag) => ipcRenderer.invoke('services:get-by-tag', tag),

    // Products
    getProducts: () => ipcRenderer.invoke('products:get-all'),
    createProduct: (product) => ipcRenderer.invoke('products:create', product),
    updateProduct: (id, product) => ipcRenderer.invoke('products:update', id, product),
    deleteProduct: (id) => ipcRenderer.invoke('products:delete', id),
    getProductByTag: (tag) => ipcRenderer.invoke('products:get-by-tag', tag),
    
    //Product-Service management functions
    addServiceToProduct: (productId, serviceId, quantity) => ipcRenderer.invoke('products:add-service', productId, serviceId, quantity),
    removeServiceFromProduct: (productId, serviceId) => ipcRenderer.invoke('products:remove-service', productId, serviceId),
    getServicesForProduct: (productId) => ipcRenderer.invoke('products:get-services-for-product', productId),

    // Pricing Plans
    getPlansByProductId: (productId) => ipcRenderer.invoke('products:get-plans', productId),
    addPlanToProduct: (productId, plan) => ipcRenderer.invoke('products:add-plan', productId, plan),
});
