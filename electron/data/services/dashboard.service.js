const { getDB } = require('../database');

const queryGet = (db, sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const queryAll = (db, sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const getDashboardStats = async () => {
    const db = getDB();
    console.log("Dashboard Service: querying stats from DB path:", db.filename);

    try {
        // Counts
        // Note: db.get returns the row object, so result.count gives the value
        const productResult = await queryGet(db, 'SELECT COUNT(*) as count FROM products');
        const userResult = await queryGet(db, 'SELECT COUNT(*) as count FROM users');
        const serviceResult = await queryGet(db, 'SELECT COUNT(*) as count FROM services');

        const productCount = productResult ? productResult.count : 0;
        const userCount = userResult ? userResult.count : 0;
        const serviceCount = serviceResult ? serviceResult.count : 0;

        console.log("Dashboard Service: counts found - P:", productCount, "U:", userCount, "S:", serviceCount);

        // Recent Products (Top 5)
        const recentProducts = await queryAll(db, `
            SELECT id, name, created_at, price 
            FROM products 
            ORDER BY created_at DESC 
            LIMIT 5
        `);

        console.log("Dashboard Service: recent products found:", recentProducts?.length);

        return {
            totalProducts: productCount,
            totalUsers: userCount,
            totalServices: serviceCount,
            recentProducts: recentProducts || []
        };
    } catch (err) {
        console.error("Dashboard Service Error:", err);
        return {
            totalProducts: 0,
            totalUsers: 0,
            totalServices: 0,
            recentProducts: []
        };
    }
};

module.exports = {
    getDashboardStats
};
