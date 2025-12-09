const { dbRun, dbGet, dbAll } = require('../db-helper');

// --- CRUD ---

// Create
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

// Read (All)
const getAllProducts = async () => {
    const sql = `SELECT * FROM products`;
    return await dbAll(sql);
};

// Read (One)
const getProductById = async (id) => {
    const sql = `SELECT * FROM products WHERE id = ?`;
    return await dbGet(sql, [id]);
};

// Read (By Code)
const getProductByCode = async (code) => {
    const sql = `SELECT * FROM products WHERE code = ?`;
    return await dbGet(sql, [code]);
};

// Update
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

// Delete
const deleteProduct = async (id) => {
    const sql = `DELETE FROM products WHERE id = ?`;
    return await dbRun(sql, [id]);
};

// --- Sub-Resources: Pricing Plans (Example of One-to-Many management) ---

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
    addPlanToProduct
};