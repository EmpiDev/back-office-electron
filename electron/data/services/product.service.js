const { dbRun, dbGet, dbAll } = require('../db-helper');

// --- CRUD for Products ---

// Create Product
const createProduct = async (product) => {
    const sql = `
        INSERT INTO products (name, description, target_segment, is_in_carousel, is_top_product, price, payment_type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await dbRun(sql, [
        product.name,
        product.description,
        product.target_segment,
        product.is_in_carousel ? 1 : 0,
        product.is_top_product ? 1 : 0,
        product.price,
        product.payment_type
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

// Update Product
const updateProduct = async (id, product) => {
    const sql = `
        UPDATE products
        SET name = ?, description = ?, target_segment = ?, is_in_carousel = ?, is_top_product = ?, price = ?, payment_type = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    await dbRun(sql, [
        product.name,
        product.description,
        product.target_segment,
        product.is_in_carousel ? 1 : 0,
        product.is_top_product ? 1 : 0,
        product.price,
        product.payment_type,
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
        SELECT ps.service_id, ps.quantity, s.name, s.description
        FROM product_services ps
        JOIN services s ON ps.service_id = s.id
        WHERE ps.product_id = ?
    `;
    return await dbAll(sql, [productId]);
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    addServiceToProduct,
    removeServiceFromProduct,
    getServicesForProduct
};