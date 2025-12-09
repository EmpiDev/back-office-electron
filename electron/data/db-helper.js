const { getDB } = require('./database');

// Wrapper pour utiliser les Promises au lieu des callbacks
const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        const db = getDB();
        db.run(sql, params, function (err) {
            if (err) {
                console.error('Error running sql ' + sql);
                console.error(err);
                reject(err);
            } else {
                // 'this' contient lastID et changes
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
};

const dbGet = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        const db = getDB();
        db.get(sql, params, (err, row) => {
            if (err) {
                console.error('Error running sql ' + sql);
                console.error(err);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

const dbAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        const db = getDB();
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Error running sql ' + sql);
                console.error(err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

module.exports = { dbRun, dbGet, dbAll };
