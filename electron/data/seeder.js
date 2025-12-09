const initialData = {
    users: [
        { username: 'admin', password_hash: 'admin123', role: 'admin' },
        { username: 'user', password_hash: 'user123', role: 'user' }
    ],
    categories: [
        { name: 'Support', description: 'Technical support services' },
        { name: 'Consulting', description: 'Expert consulting' },
        { name: 'Development', description: 'Software development' },
        { name: 'Security', description: 'Cybersecurity services' }
    ],
    services: [
        { code: 'SRV-SUP-L1', name: 'Level 1 Support', description: 'Basic email support', unit: 'Ticket', category_name: 'Support' },
        { code: 'SRV-AUDIT-SEC', name: 'Security Audit', description: 'Full infrastructure audit', unit: 'Day', category_name: 'Security' },
        { code: 'SRV-DEV-WEB', name: 'Web Development', description: 'React/Node development', unit: 'Day', category_name: 'Development' },
        { code: 'SRV-SOC-MON', name: 'SOC Monitoring', description: '24/7 Security Monitoring', unit: 'Month', category_name: 'Security' }
    ],
    products: [
        { 
            code: 'PRD-AUDIT-PACK', 
            name: 'Audit Pack', 
            description: 'Complete security assessment', 
            target_segment: 'SME', 
            is_in_carousel: 1, 
            is_top_product: 0,
            services: [
                { code: 'SRV-AUDIT-SEC', quantity: 5 } // Volume: 5 Days of audit
            ]
        },
        { 
            code: 'PRD-SOC-YEAR', 
            name: 'Managed SOC', 
            description: 'Yearly SOC subscription', 
            target_segment: 'Enterprise', 
            is_in_carousel: 1, 
            is_top_product: 1,
            services: [
                { code: 'SRV-SOC-MON', quantity: 12 }, // Volume: 12 Months
                { code: 'SRV-SUP-L1', quantity: 100 }  // Volume: 100 Tickets included
            ]
        }
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
                    
                    await run("INSERT INTO services (code, name, description, unit, category_id) VALUES (?, ?, ?, ?, ?)", 
                        [srv.code, srv.name, srv.description, srv.unit, catId]);
                    console.log(`Service seeded: ${srv.code}`);
                }
            }

             // Products
             for (const prod of initialData.products) {
                let prodId;
                const existingProd = await get("SELECT id FROM products WHERE code = ?", [prod.code]);
                
                if (!existingProd) {
                    const result = await run("INSERT INTO products (code, name, description, target_segment, is_in_carousel, is_top_product) VALUES (?, ?, ?, ?, ?, ?)", 
                        [prod.code, prod.name, prod.description, prod.target_segment, prod.is_in_carousel, prod.is_top_product]);
                    prodId = result.lastID;
                    console.log(`Product seeded: ${prod.code}`);

                    // Seed Product-Services (Volume)
                    if (prod.services) {
                        for (const prodSrv of prod.services) {
                            const service = await get("SELECT id FROM services WHERE code = ?", [prodSrv.code]);
                            if (service) {
                                await run("INSERT INTO product_services (product_id, service_id, quantity) VALUES (?, ?, ?)", 
                                    [prodId, service.id, prodSrv.quantity]);
                                console.log(`   -> Linked service ${prodSrv.code} (Qty: ${prodSrv.quantity})`);
                            }
                        }
                    }

                } else {
                    prodId = existingProd.id;
                }
            }
            
            console.log('Seeding completed.');

        } catch (err) {
            console.error('Seeding error:', err);
        }
    })();
}

module.exports = seedDatabase;
