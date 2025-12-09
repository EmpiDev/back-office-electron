// electron/main.js
const { app, BrowserWindow, Menu, ipcMain, Notification } = require("electron");
const path = require("path");
const { initDB } = require("./data/database");

// Services
const userService = require('./data/services/user.service');
const serviceService = require('./data/services/service.service');
const productService = require('./data/services/product.service');

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

// Services
ipcMain.handle('services:get-all', async () => {
    return await serviceService.getAllServices();
});
ipcMain.handle('services:create', async (_event, service) => {
    return await serviceService.createService(service);
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
ipcMain.handle('products:delete', async (_event, id) => {
    return await productService.deleteProduct(id);
});


app.whenReady().then(() => {
    initDB();
    app.setName(APP_NAME);
    createWindow();
});
