const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');
const schema = require('./schema');
const seedDatabase = require('./seeder');

let db;

function initDB() {
    // Use userData directory for persistence across updates/installs
    // In development, you might want to use a local path, e.g.:
    // const dbPath = path.join(__dirname, '../../cyna.db');
    const dbPath = path.join(app.getPath('userData'), 'cyna.db');
    console.log('Database path:', dbPath);

    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Could not connect to database', err);
        } else {
            console.log('Connected to database');
            // Enable foreign keys
            db.run('PRAGMA foreign_keys = ON;', (err) => {
                if (err) console.error("Failed to enable foreign keys", err);
            });

            db.exec(schema, (err) => {
                if (err) {
                    console.error('Schema execution failed', err);
                } else {
                    console.log('Database schema initialized');
                    seedDatabase(db);
                }
            });
        }
    });

    return db;
}

function getDB() {
    if (!db) {
        throw new Error("Database not initialized. Call initDB() first.");
    }
    return db;
}

module.exports = { initDB, getDB };
