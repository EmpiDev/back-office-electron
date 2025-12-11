const { dbRun, dbGet, dbAll } = require('../db-helper');
const BusinessError = require('../../utils/BusinessError');

// --- Helper for Validation ---
const validateCategory = (category) => {
    if (!category.name || category.name.trim() === '') {
        throw new BusinessError('Le nom de la catégorie est obligatoire.', 400);
    }
};

// Create Category
const createCategory = async (category) => {
    validateCategory(category);
    const sql = `INSERT INTO categories (name, description) VALUES (?, ?)`;
    const result = await dbRun(sql, [category.name, category.description]);
    return { id: result.id, ...category };
};

// Read All Categories
const getAllCategories = async () => {
    const sql = `SELECT * FROM categories ORDER BY name ASC`;
    return await dbAll(sql);
};

// Update Category
const updateCategory = async (id, category) => {
    validateCategory(category);
    const sql = `UPDATE categories SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await dbRun(sql, [category.name, category.description, id]);
    return { id, ...category };
};

// Delete Category
const deleteCategory = async (id) => {
    const sql = `DELETE FROM categories WHERE id = ?`;
    return await dbRun(sql, [id]);
};

module.exports = {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
};
