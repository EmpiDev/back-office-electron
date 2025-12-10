// electron/main.js
const { app, BrowserWindow, Menu, ipcMain, Notification } = require("electron");
const path = require("path");
const { initDB } = require("./data/database");

// Services
const userService = require('./data/services/user.service');
const serviceService = require('./data/services/service.service');
const productService = require('./data/services/product.service');
const tagService = require('./data/services/tag.service');
const categoryService = require('./data/services/category.service');
const dashboardService = require('./data/services/dashboard.service');

const APP_NAME = "Mon app";

const isDev = !app.isPackaged; // true en dev, false en prod

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 720,
        title: APP_NAME,
        backgroundColor: "#ffffff",
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    if (isDev) {
        win.loadURL("http://localhost:5173");
    } else {
        win.loadFile(path.join(__dirname, "../renderer/dist/index.html"));
    }
}

ipcMain.handle('jokes:notify-added', (_event, joke) => {
    if (Notification.isSupported()) {
        new Notification({
            title: 'Nouvelle blague ajoutée',
            body: joke?.question || 'Une nouvelle blague a été ajoutée.',
        }).show();
    }
});

// --- IPC Handlers for Data Services ---

// Users
ipcMain.handle('users:get-all', async () => {
    return await userService.getAllUsers();
});
ipcMain.handle('users:create', async (_event, user) => {
    return await userService.createUser(user);
});
ipcMain.handle('users:delete', async (_event, user) => {
    return await userService.deleteUser(user);
});
ipcMain.handle('users:update', async (_event, id, user) => {
    return await userService.updateUser(id, user);
});

// Services
ipcMain.handle('services:get-all', async () => {
    return await serviceService.getAllServices();
});
ipcMain.handle('services:create', async (_event, service) => {
    return await serviceService.createService(service);
});
ipcMain.handle('services:update', async (_event, id, service) => {
    return await serviceService.updateService(id, service);
});
ipcMain.handle('services:delete', async (_event, id) => {
    return await serviceService.deleteService(id);
});

// Products
ipcMain.handle('products:get-all', async () => {
    return await productService.getAllProducts();
});
ipcMain.handle('products:create', async (_event, product) => {
    return await productService.createProduct(product);
});
ipcMain.handle('products:update', async (_event, id, product) => {
    return await productService.updateProduct(id, product);
});
ipcMain.handle('products:delete', async (_event, id) => {
    return await productService.deleteProduct(id);
});

// Handlers for Product-Service relationships
ipcMain.handle('products:add-service', async (_event, productId, serviceId, quantity) => {
    return await productService.addServiceToProduct(productId, serviceId, quantity);
});
ipcMain.handle('products:remove-service', async (_event, productId, serviceId) => {
    return await productService.removeServiceFromProduct(productId, serviceId);
});
ipcMain.handle('products:get-services-for-product', async (_event, productId) => {
    return await productService.getServicesForProduct(productId);
});



// Tags
ipcMain.handle('tags:get-all', async () => {
    return await tagService.getAllTags();
});
ipcMain.handle('tags:create', async (_event, tag) => {
    return await tagService.createTag(tag);
});
ipcMain.handle('tags:update', async (_event, id, tag) => {
    return await tagService.updateTag(id, tag);
});
ipcMain.handle('tags:delete', async (_event, id) => {
    return await tagService.deleteTag(id);
});

// Tag-Service relationships
ipcMain.handle('tags:get-for-service', async (_event, serviceId) => {
    return await tagService.getTagsForService(serviceId);
});
ipcMain.handle('tags:add-to-service', async (_event, serviceId, tagId) => {
    return await tagService.addTagToService(serviceId, tagId);
});
ipcMain.handle('tags:remove-from-service', async (_event, serviceId, tagId) => {
    return await tagService.removeTagFromService(serviceId, tagId);
});

// Tag-Product relationships
ipcMain.handle('tags:get-for-product', async (_event, productId) => {
    return await tagService.getTagsForProduct(productId);
});
ipcMain.handle('tags:add-to-product', async (_event, productId, tagId) => {
    return await tagService.addTagToProduct(productId, tagId);
});
ipcMain.handle('tags:remove-from-product', async (_event, productId, tagId) => {
    return await tagService.removeTagFromProduct(productId, tagId);
});

// Categories
ipcMain.handle('categories:get-all', async () => {
    return await categoryService.getAllCategories();
});
ipcMain.handle('categories:create', async (_event, category) => {
    return await categoryService.createCategory(category);
});
ipcMain.handle('categories:update', async (_event, id, category) => {
    return await categoryService.updateCategory(id, category);
});
ipcMain.handle('categories:delete', async (_event, id) => {
    return await categoryService.deleteCategory(id);
});

// Dashboard
ipcMain.handle('dashboard:get-stats', async () => {
    return await dashboardService.getDashboardStats();
});


app.whenReady().then(() => {
    app.setName(APP_NAME);
    initDB();
    createWindow();
});
