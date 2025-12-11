const { dbRun, dbGet, dbAll } = require('../db-helper');
const BusinessError = require('../../utils/BusinessError');

// --- Helper for Validation ---
const validateUser = (user) => {
    if (!user.username || user.username.trim() === '') {
        throw new BusinessError("Le nom d'utilisateur est obligatoire.", 400);
    }
};

// --- CRUD ---

// Create
const createUser = async (user) => {
    validateUser(user);
    const sql = `
        INSERT INTO users (username, password_hash, role)
        VALUES (?, ?, ?)
    `;
    // Note: Dans une vraie app, hachez le mot de passe avant d'appeler cette fonction (via bcrypt par exemple dans le main process)
    const result = await dbRun(sql, [user.username, user.password_hash, user.role]);
    return { id: result.id, ...user };
};

// Read (All)
const getAllUsers = async () => {
    const sql = `SELECT id, username, role, created_at FROM users`;
    return await dbAll(sql);
};

// Read (One by ID)
const getUserById = async (id) => {
    const sql = `SELECT id, username, role, created_at FROM users WHERE id = ?`;
    return await dbGet(sql, [id]);
};

// Read (By Username - utile pour le login)
const getUserByUsername = async (username) => {
    const sql = `SELECT * FROM users WHERE username = ?`;
    return await dbGet(sql, [username]);
};

// Update
const updateUser = async (id, user) => {
    validateUser(user);
    const sql = `
        UPDATE users
        SET username = ?, role = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    // Note: On ne met pas à jour le mot de passe ici pour simplifier, à faire dans une méthode dédiée si besoin
    await dbRun(sql, [user.username, user.role, id]);
    return await getUserById(id);
};

// Delete
const deleteUser = async (id) => {
    const sql = `DELETE FROM users WHERE id = ?`;
    return await dbRun(sql, [id]);
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    getUserByUsername,
    updateUser,
    deleteUser
};
