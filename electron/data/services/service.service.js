const { dbRun, dbGet, dbAll } = require('../db-helper');

// --- CRUD ---

// Create
const createService = async (service) => {
    // Generate a unique legacy tag if not provided to satisfy DB constraint
    const legacyTag = service.tag || `srv_${Date.now()}_${Math.floor(Math.random() * 1000)} `;

    const sql = `
        INSERT INTO services(tag, name, description, unit, category_id)
VALUES(?, ?, ?, ?, ?)
    `;
    const result = await dbRun(sql, [legacyTag, service.name, service.description, service.unit, service.category_id]);
    return { id: result.id, ...service, tag: legacyTag };
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

// Update
const updateService = async (id, service) => {
    const sql = `
        UPDATE services
        SET name = ?, description = ?, unit = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    await dbRun(sql, [service.name, service.description, service.unit, service.category_id, id]);
    return await getServiceById(id);
};

// Delete
const deleteService = async (id) => {
    const sql = `DELETE FROM services WHERE id = ? `;
    return await dbRun(sql, [id]);
};

module.exports = {
    createService,
    getAllServices,
    getServiceById,
    updateService,
    deleteService
};