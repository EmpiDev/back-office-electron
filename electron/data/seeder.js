const initialData = {
    users: [
        { username: 'admin', password_hash: 'admin123', role: 'admin' },
        { username: 'user', password_hash: 'user123', role: 'user' }
    ],
    categories: [
        { name: 'Support', description: 'Technical support services' },
        { name: 'Consulting', description: 'Expert consulting' },
        { name: 'Development', description: 'Software development' }
    ],
    services: [
        { code: 'SRV-SUP-L1', name: 'Level 1 Support', description: 'Basic email support', category_name: 'Support' },
        { code: 'SRV-SUP-L2', name: 'Level 2 Support', description: 'Phone and email support', category_name: 'Support' },
        { code: 'SRV-DEV-WEB', name: 'Web Development', description: 'React/Node development', category_name: 'Development' }
    ],
    products: [
        { code: 'PRD-STARTER', name: 'Starter Pack', description: 'Essential tools for small teams', target_segment: 'SME', is_highlighted: 1 },
        { code: 'PRD-PRO', name: 'Pro Pack', description: 'Advanced features for scaling businesses', target_segment: 'Mid-Market', is_highlighted: 1 },
        { code: 'PRD-ENT', name: 'Enterprise Suite', description: 'Full access with dedicated support', target_segment: 'Enterprise', is_highlighted: 0 }
    ]
};

function seedDatabase(db) {
    console.log('Starting database seeding...');

    // Helper to run query as promise
    const run = (sql, params = []) => new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });

    const get = (sql, params = []) => new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });

    (async () => {
        try {
            // Users
            for (const user of initialData.users) {
                const exists = await get("SELECT id FROM users WHERE username = ?", [user.username]);
                if (!exists) {
                    await run("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", 
                        [user.username, user.password_hash, user.role]);
                    console.log(`User seeded: ${user.username}`);
                }
            }

            // Categories
            for (const cat of initialData.categories) {
                const exists = await get("SELECT id FROM categories WHERE name = ?", [cat.name]);
                if (!exists) {
                    await run("INSERT INTO categories (name, description) VALUES (?, ?)", [cat.name, cat.description]);
                    console.log(`Category seeded: ${cat.name}`);
                }
            }

            // Services
            for (const srv of initialData.services) {
                const exists = await get("SELECT id FROM services WHERE code = ?", [srv.code]);
                if (!exists) {
                    const cat = await get("SELECT id FROM categories WHERE name = ?", [srv.category_name]);
                    const catId = cat ? cat.id : null;
                    
                    await run("INSERT INTO services (code, name, description, category_id) VALUES (?, ?, ?, ?)", 
                        [srv.code, srv.name, srv.description, catId]);
                    console.log(`Service seeded: ${srv.code}`);
                }
            }

             // Products
             for (const prod of initialData.products) {
                const exists = await get("SELECT id FROM products WHERE code = ?", [prod.code]);
                if (!exists) {
                    await run("INSERT INTO products (code, name, description, target_segment, is_highlighted) VALUES (?, ?, ?, ?, ?)", 
                        [prod.code, prod.name, prod.description, prod.target_segment, prod.is_highlighted]);
                    console.log(`Product seeded: ${prod.code}`);
                }
            }
            
            console.log('Seeding completed.');

        } catch (err) {
            console.error('Seeding error:', err);
        }
    })();
}

module.exports = seedDatabase;
