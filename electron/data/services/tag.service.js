const { dbRun, dbGet, dbAll } = require('../db-helper');
const BusinessError = require('../../utils/BusinessError');

// --- Helper for Validation ---
const validateTag = (tag) => {
    if (!tag.name || tag.name.trim() === '') {
        throw new BusinessError('Le nom du tag est obligatoire.', 400);
    }
};

// --- CRUD for Tags ---

// Create Tag
const createTag = async (tag) => {
    validateTag(tag);
    const sql = `
        INSERT INTO tags (name)
        VALUES (?)
    `;
    const result = await dbRun(sql, [tag.name]);
    return { id: result.id, ...tag };
};

// Read All Tags
const getAllTags = async () => {
    const sql = `SELECT * FROM tags ORDER BY name ASC`;
    return await dbAll(sql);
};

// Read One Tag by ID
const getTagById = async (id) => {
    const sql = `SELECT * FROM tags WHERE id = ?`;
    return await dbGet(sql, [id]);
};

// Update Tag
const updateTag = async (id, tag) => {
    validateTag(tag);
    const sql = `
        UPDATE tags
        SET name = ?
        WHERE id = ?
    `;
    await dbRun(sql, [tag.name, id]);
    return await getTagById(id);
};

// Delete Tag
const deleteTag = async (id) => {
    const sql = `DELETE FROM tags WHERE id = ?`;
    return await dbRun(sql, [id]);
};

// --- Service-Tag Relationships ---

// Get Tags for a Service
const getTagsForService = async (serviceId) => {
    const sql = `
        SELECT t.id, t.name, t.created_at
        FROM tags t
        JOIN service_tags st ON t.id = st.tag_id
        WHERE st.service_id = ?
        ORDER BY t.name ASC
    `;
    return await dbAll(sql, [serviceId]);
};

// Add Tag to Service
const addTagToService = async (serviceId, tagId) => {
    const sql = `
        INSERT OR IGNORE INTO service_tags (service_id, tag_id)
        VALUES (?, ?)
    `;
    const result = await dbRun(sql, [serviceId, tagId]);
    return { service_id: serviceId, tag_id: tagId, id: result.id };
};

// Remove Tag from Service
const removeTagFromService = async (serviceId, tagId) => {
    const sql = `DELETE FROM service_tags WHERE service_id = ? AND tag_id = ?`;
    return await dbRun(sql, [serviceId, tagId]);
};

// --- Product-Tag Relationships ---

// Get Tags for a Product
const getTagsForProduct = async (productId) => {
    const sql = `
        SELECT t.id, t.name, t.created_at
        FROM tags t
        JOIN product_tags pt ON t.id = pt.tag_id
        WHERE pt.product_id = ?
        ORDER BY t.name ASC
    `;
    return await dbAll(sql, [productId]);
};

// Add Tag to Product
const addTagToProduct = async (productId, tagId) => {
    const sql = `
        INSERT OR IGNORE INTO product_tags (product_id, tag_id)
        VALUES (?, ?)
    `;
    const result = await dbRun(sql, [productId, tagId]);
    return { product_id: productId, tag_id: tagId, id: result.id };
};

// Remove Tag from Product
const removeTagFromProduct = async (productId, tagId) => {
    const sql = `DELETE FROM product_tags WHERE product_id = ? AND tag_id = ?`;
    return await dbRun(sql, [productId, tagId]);
};

module.exports = {
    createTag,
    getAllTags,
    getTagById,
    updateTag,
    deleteTag,
    getTagsForService,
    addTagToService,
    removeTagFromService,
    getTagsForProduct,
    addTagToProduct,
    removeTagFromProduct
};
