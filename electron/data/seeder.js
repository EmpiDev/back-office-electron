const initialData = {
    users: [
        { username: 'admin', password_hash: 'admin123', role: 'admin' },
        { username: 'user', password_hash: 'user123', role: 'user' }
    ],
    categories: [
        { name: 'Support', description: 'Technical support services' },
        { name: 'Consulting', description: 'Expert consulting' },
        { name: 'Development', description: 'Software development' },
        { name: 'Security', description: 'Cybersecurity services' },
        { name: 'Infrastructure', description: 'Cloud and On-Premise infrastructure' },
        { name: 'Training', description: 'Professional training and workshops' }
    ],
    services: [
        { tag: 'SRV-SUP-L1', name: 'Level 1 Support', description: 'Basic email support', unit: 'Ticket', category_name: 'Support' },
        { tag: 'SRV-AUDIT-SEC', name: 'Security Audit', description: 'Full infrastructure audit', unit: 'Day', category_name: 'Security' },
        { tag: 'SRV-DEV-WEB', name: 'Web Development', description: 'React/Node development', unit: 'Day', category_name: 'Development' },
        { tag: 'SRV-SOC-MON', name: 'SOC Monitoring', description: '24/7 Security Monitoring', unit: 'Month', category_name: 'Security' }
    ],
    products: [
        {
            tag: 'PRD-AUDIT-PACK',
            name: 'Audit Pack',
            description: 'Complete security assessment',
            target_segment: 'SME',
            is_in_carousel: 1,
            is_top_product: 0,
            price: 5000,
            payment_type: 'one_time',
            services: [
                { tag: 'SRV-AUDIT-SEC', quantity: 5 } // Volume: 5 Days of audit
            ],
            tags: ['Security', 'Compliance', 'SME', 'On-Premise']
        },
        {
            tag: 'PRD-SOC-YEAR',
            name: 'Managed SOC',
            description: 'Yearly SOC subscription',
            target_segment: 'Enterprise',
            is_in_carousel: 1,
            is_top_product: 1,
            price: 2000,
            payment_type: 'monthly',
            services: [
                { tag: 'SRV-SOC-MON', quantity: 12 }, // Volume: 12 Months
                { tag: 'SRV-SUP-L1', quantity: 100 }  // Volume: 100 Tickets included
            ],
            tags: ['Security', '24/7', 'Enterprise', 'Cloud', 'Monitoring']
        },
        {
            tag: 'PRD-DEV-START',
            name: 'Startup Dev Pack',
            description: 'Full stack development team for 1 month',
            target_segment: 'Startup',
            is_in_carousel: 1,
            is_top_product: 0,
            price: 15000,
            payment_type: 'one_time',
            services: [
                { tag: 'SRV-DEV-WEB', quantity: 20 }
            ],
            tags: ['Startup', 'Development', 'Web']
        }
    ],
    tags: [
        // Deployment Type
        { name: 'Cloud' },
        { name: 'On-Premise' },
        { name: 'Hybrid' },

        // Service Level
        { name: '24/7' },
        { name: 'Business Hours' },

        // Target Segment
        { name: 'SME' },
        { name: 'Enterprise' },
        { name: 'Startup' },

        // Service Category
        { name: 'Security' },
        { name: 'Compliance' },
        { name: 'Monitoring' },
        { name: 'Consulting' },
        { name: 'Training' },

        // Technology
        { name: 'SIEM' },
        { name: 'EDR' },
        { name: 'Firewall' }
    ]
};

function seedDatabase(db) {
    console.log('Starting database seeding...');

    // Helper to run query as promise
    const run = (sql, params = []) => new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
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
                const exists = await get("SELECT id FROM services WHERE tag = ?", [srv.tag]);
                if (!exists) {
                    const cat = await get("SELECT id FROM categories WHERE name = ?", [srv.category_name]);
                    const catId = cat ? cat.id : null;

                    await run("INSERT INTO services (tag, name, description, unit, category_id) VALUES (?, ?, ?, ?, ?)",
                        [srv.tag, srv.name, srv.description, srv.unit, catId]);
                    console.log(`Service seeded: ${srv.tag}`);
                }
            }

            // Tags (must be seeded before products to allow associations)
            for (const tag of initialData.tags) {
                const exists = await get("SELECT id FROM tags WHERE name = ?", [tag.name]);
                if (!exists) {
                    await run("INSERT INTO tags (name) VALUES (?)", [tag.name]);
                    console.log(`Tag seeded: ${tag.name}`);
                }
            }

            // Products
            for (const prod of initialData.products) {
                let prodId;
                const existingProd = await get("SELECT id FROM products WHERE tag = ?", [prod.tag]);

                if (!existingProd) {
                    const result = await run("INSERT INTO products (tag, name, description, target_segment, is_in_carousel, is_top_product, price, payment_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        [prod.tag, prod.name, prod.description, prod.target_segment, prod.is_in_carousel, prod.is_top_product, prod.price, prod.payment_type]);
                    prodId = result.lastID;
                    console.log(`Product seeded: ${prod.tag}`);

                    // Seed Product-Services (Volume)
                    if (prod.services) {
                        for (const prodSrv of prod.services) {
                            const service = await get("SELECT id FROM services WHERE tag = ?", [prodSrv.tag]);
                            if (service) {
                                await run("INSERT INTO product_services (product_id, service_id, quantity) VALUES (?, ?, ?)",
                                    [prodId, service.id, prodSrv.quantity]);
                                console.log(`   -> Linked service ${prodSrv.tag} (Qty: ${prodSrv.quantity})`);
                            }
                        }
                    }

                    // Seed Product-Tags
                    if (prod.tags) {
                        for (const tagName of prod.tags) {
                            const tag = await get("SELECT id FROM tags WHERE name = ?", [tagName]);
                            if (tag) {
                                await run("INSERT INTO product_tags (product_id, tag_id) VALUES (?, ?)",
                                    [prodId, tag.id]);
                                console.log(`   -> Linked tag ${tagName}`);
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
