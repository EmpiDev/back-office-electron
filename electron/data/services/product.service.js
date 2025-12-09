const { dbRun, dbGet, dbAll } = require('../db-helper');

// --- CRUD for Products ---

// Create Product
const createProduct = async (product) => {
    const sql = `
        INSERT INTO products (code, name, description, target_segment, is_in_carousel, is_top_product)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await dbRun(sql, [
        product.code, 
        product.name, 
        product.description, 
        product.target_segment, 
        product.is_in_carousel ? 1 : 0,
        product.is_top_product ? 1 : 0
    ]);
    return { id: result.id, ...product };
};

// Read All Products
const getAllProducts = async () => {
    const sql = `SELECT * FROM products`;
    return await dbAll(sql);
};

// Read One Product by ID
const getProductById = async (id) => {
    const sql = `SELECT * FROM products WHERE id = ?`;
    return await dbGet(sql, [id]);
};

// Read One Product by Code
const getProductByCode = async (code) => {
    const sql = `SELECT * FROM products WHERE code = ?`;
    return await dbGet(sql, [code]);
};

// Update Product
const updateProduct = async (id, product) => {
    const sql = `
        UPDATE products
        SET code = ?, name = ?, description = ?, target_segment = ?, is_in_carousel = ?, is_top_product = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    await dbRun(sql, [
        product.code, 
        product.name, 
        product.description, 
        product.target_segment, 
        product.is_in_carousel ? 1 : 0,
        product.is_top_product ? 1 : 0,
        id
    ]);
    return await getProductById(id);
};

// Delete Product
const deleteProduct = async (id) => {
    const sql = `DELETE FROM products WHERE id = ?`;
    return await dbRun(sql, [id]);
};

// --- Management of Product-Service Relationships (product_services table) ---

// Add a Service to a Product
const addServiceToProduct = async (productId, serviceId, quantity = 1) => {
    const sql = `
        INSERT OR REPLACE INTO product_services (product_id, service_id, quantity)
        VALUES (?, ?, ?)
    `;
    const result = await dbRun(sql, [productId, serviceId, quantity]);
    return { product_id: productId, service_id: serviceId, quantity, id: result.id };
};

// Remove a Service from a Product
const removeServiceFromProduct = async (productId, serviceId) => {
    const sql = `DELETE FROM product_services WHERE product_id = ? AND service_id = ?`;
    return await dbRun(sql, [productId, serviceId]);
};

// Get Services associated with a Product
const getServicesForProduct = async (productId) => {
    const sql = `
        SELECT ps.service_id, ps.quantity, s.code, s.name, s.description, s.unit
        FROM product_services ps
        JOIN services s ON ps.service_id = s.id
        WHERE ps.product_id = ?
    `;
    return await dbAll(sql, [productId]);
};

// --- Sub-Resources: Pricing Plans ---

const getPlansByProductId = async (productId) => {
    const sql = `SELECT * FROM pricing_plans WHERE product_id = ?`;
    return await dbAll(sql, [productId]);
};

const addPlanToProduct = async (productId, plan) => {
    const sql = `
        INSERT INTO pricing_plans (product_id, name, price, currency, billing_interval)
        VALUES (?, ?, ?, ?, ?)
    `;
    const result = await dbRun(sql, [
        productId,
        plan.name,
        plan.price,
        plan.currency || 'EUR',
        plan.billing_interval
    ]);
    return { id: result.id, product_id: productId, ...plan };
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    getProductByCode,
    updateProduct,
    deleteProduct,
    getPlansByProductId,
    addPlanToProduct,
    addServiceToProduct,
    removeServiceFromProduct,
    getServicesForProduct
};