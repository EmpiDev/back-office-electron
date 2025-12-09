const { dbRun, dbGet, dbAll } = require('../db-helper');

// --- CRUD ---

// Create
const createService = async (service) => {
    const sql = `
        INSERT INTO services (tag, name, description, unit, category_id)
        VALUES (?, ?, ?, ?, ?)
    `;
    const result = await dbRun(sql, [service.tag, service.name, service.description, service.unit, service.category_id]);
    return { id: result.id, ...service };
};

// Read (All) - Avec jointure optionnelle pour récupérer le nom de la catégorie
const getAllServices = async () => {
    const sql = `
        SELECT s.*, c.name as category_name 
        FROM services s
        LEFT JOIN categories c ON s.category_id = c.id
    `;
    return await dbAll(sql);
};

// Read (One)
const getServiceById = async (id) => {
    const sql = `
        SELECT s.*, c.name as category_name 
        FROM services s
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.id = ?
    `;
    return await dbGet(sql, [id]);
};

// Read (By Tag)
const getServiceByTag = async (tag) => {
    const sql = `SELECT * FROM services WHERE tag = ?`;
    return await dbGet(sql, [tag]);
};

// Update
const updateService = async (id, service) => {
    const sql = `
        UPDATE services
        SET tag = ?, name = ?, description = ?, unit = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    await dbRun(sql, [service.tag, service.name, service.description, service.unit, service.category_id, id]);
    return await getServiceById(id);
};

// Delete
const deleteService = async (id) => {
    const sql = `DELETE FROM services WHERE id = ?`;
    return await dbRun(sql, [id]);
};

module.exports = {
    createService,
    getAllServices,
    getServiceById,
    getServiceByTag,
    updateService,
    deleteService
};