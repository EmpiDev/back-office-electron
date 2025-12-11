// electron/main.js
const { app, BrowserWindow, ipcMain } = require("electron");
// Force reload for backend changes
const path = require("path");
const { initDB } = require("./data/database");

// Services
const userService = require('./data/services/user.service');
const serviceService = require('./data/services/service.service');
const productService = require('./data/services/product.service');
const tagService = require('./data/services/tag.service');
const categoryService = require('./data/services/category.service');
const dashboardService = require('./data/services/dashboard.service');

const APP_NAME = "Cyna back office";

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

// Helper for standardized API responses
const handleRequest = async (operation) => {
    try {
        const data = await operation();
        return { success: true, code: 200, data };
    } catch (error) {
        console.error("IPC Error:", error);
        const code = error.code || error.status || 500;
        return { success: false, code: typeof code === 'number' ? code : 500, error: error.message };
    }
};



// --- IPC Handlers for Data Services ---

// Users
ipcMain.handle('users:get-all', async () => handleRequest(() => userService.getAllUsers()));
ipcMain.handle('users:create', async (_event, user) => handleRequest(() => userService.createUser(user)));
ipcMain.handle('users:delete', async (_event, user) => handleRequest(() => userService.deleteUser(user)));
ipcMain.handle('users:update', async (_event, id, user) => handleRequest(() => userService.updateUser(id, user)));

// Services
ipcMain.handle('services:get-all', async () => handleRequest(() => serviceService.getAllServices()));
ipcMain.handle('services:create', async (_event, service) => handleRequest(() => serviceService.createService(service)));
ipcMain.handle('services:update', async (_event, id, service) => handleRequest(() => serviceService.updateService(id, service)));
ipcMain.handle('services:delete', async (_event, id) => handleRequest(() => serviceService.deleteService(id)));

// Products
ipcMain.handle('products:get-all', async () => handleRequest(() => productService.getAllProducts()));
ipcMain.handle('products:create', async (_event, product) => handleRequest(() => productService.createProduct(product)));
ipcMain.handle('products:update', async (_event, id, product) => handleRequest(() => productService.updateProduct(id, product)));
ipcMain.handle('products:delete', async (_event, id) => handleRequest(() => productService.deleteProduct(id)));

// Product Services
ipcMain.handle('products:add-service', async (_event, productId, serviceId, quantity) => handleRequest(() => productService.addServiceToProduct(productId, serviceId, quantity)));
ipcMain.handle('products:remove-service', async (_event, productId, serviceId) => handleRequest(() => productService.removeServiceFromProduct(productId, serviceId)));
ipcMain.handle('products:get-services-for-product', async (_event, productId) => handleRequest(() => productService.getServicesForProduct(productId)));

// Tags
ipcMain.handle('tags:get-all', async () => handleRequest(() => tagService.getAllTags()));
ipcMain.handle('tags:create', async (_event, tag) => handleRequest(() => tagService.createTag(tag)));
ipcMain.handle('tags:update', async (_event, id, tag) => handleRequest(() => tagService.updateTag(id, tag)));
ipcMain.handle('tags:delete', async (_event, id) => handleRequest(() => tagService.deleteTag(id)));

// Tag-Service relationships
ipcMain.handle('tags:get-for-service', async (_event, serviceId) => handleRequest(() => tagService.getTagsForService(serviceId)));
ipcMain.handle('tags:add-to-service', async (_event, serviceId, tagId) => handleRequest(() => tagService.addTagToService(serviceId, tagId)));
ipcMain.handle('tags:remove-from-service', async (_event, serviceId, tagId) => handleRequest(() => tagService.removeTagFromService(serviceId, tagId)));

// Tag-Product relationships
ipcMain.handle('tags:get-for-product', async (_event, productId) => handleRequest(() => tagService.getTagsForProduct(productId)));
ipcMain.handle('tags:add-to-product', async (_event, productId, tagId) => handleRequest(() => tagService.addTagToProduct(productId, tagId)));
ipcMain.handle('tags:remove-from-product', async (_event, productId, tagId) => handleRequest(() => tagService.removeTagFromProduct(productId, tagId)));

// Categories
ipcMain.handle('categories:get-all', async () => handleRequest(() => categoryService.getAllCategories()));
ipcMain.handle('categories:create', async (_event, category) => handleRequest(() => categoryService.createCategory(category)));
ipcMain.handle('categories:update', async (_event, id, category) => handleRequest(() => categoryService.updateCategory(id, category)));
ipcMain.handle('categories:delete', async (_event, id) => handleRequest(() => categoryService.deleteCategory(id)));

// Dashboard
ipcMain.handle('dashboard:get-stats', async () => handleRequest(() => dashboardService.getDashboardStats()));

app.whenReady().then(() => {
    app.setName(APP_NAME);
    initDB();
    createWindow();
});
