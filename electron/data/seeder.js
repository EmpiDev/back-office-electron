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
        { name: 'Training', description: 'Professional training and workshops' },
        { name: 'Maintenance', description: 'Hardware and Software maintenance' },
        { name: 'Marketing', description: 'Digital marketing and SEO' }
    ],
    services: [
        { name: 'Level 1 Support', description: 'Basic email support', category_name: 'Support', tags: ['Support', 'Business Hours'] },
        { name: 'Security Audit', description: 'Full infrastructure audit', category_name: 'Security', tags: ['Security', 'Audit', 'Compliance'] },
        { name: 'Web Development', description: 'React/Node development', category_name: 'Development', tags: ['Development', 'Web'] },
        { name: 'SOC Monitoring', description: '24/7 Security Monitoring', category_name: 'Security', tags: ['Security', 'Monitoring', 'SIEM', '24/7'] },
        { name: 'Server Maintenance', description: 'Monthly server patching and updates', category_name: 'Maintenance', tags: ['Maintenance', 'Infrastructure'] },
        { name: 'SEO Optimization', description: 'Website ranking improvement', category_name: 'Marketing', tags: ['Marketing', 'Web'] }
    ],
    products: [
        {
            name: 'Audit Pack',
            description: 'Complete security assessment',
            target_segment: 'SME',
            is_in_carousel: 0,
            is_top_product: 0,
            price: 5000,
            payment_type: 'one_time',
            services: [
                { name: 'Security Audit', quantity: 5 } // Volume: 5 Days of audit
            ],
            tags: ['Security', 'Compliance', 'SME', 'On-Premise']
        },
        {
            name: 'Managed SOC',
            description: 'Yearly SOC subscription',
            target_segment: 'Enterprise',
            is_in_carousel: 0,
            is_top_product: 0,
            price: 2000,
            payment_type: 'monthly',
            services: [
                { name: 'SOC Monitoring', quantity: 12 }, // Volume: 12 Months
                { name: 'Level 1 Support', quantity: 100 }  // Volume: 100 Tickets included
            ],
            tags: ['Security', '24/7', 'Enterprise', 'Cloud', 'Monitoring']
        },
        {
            name: 'Startup Dev Pack',
            description: 'Full stack development team for 1 month',
            target_segment: 'Startup',
            is_in_carousel: 0,
            is_top_product: 0,
            price: 15000,
            payment_type: 'one_time',
            services: [
                { name: 'Web Development', quantity: 20 }
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
        { name: 'Firewall' },

        // Functional Domains
        { name: 'Development' },
        { name: 'Web' },
        { name: 'Support' },
        { name: 'Audit' },
        { name: 'Maintenance' },
        { name: 'Marketing' }
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
                const exists = await get("SELECT id FROM services WHERE name = ?", [srv.name]);
                if (!exists) {
                    const cat = await get("SELECT id FROM categories WHERE name = ?", [srv.category_name]);
                    const catId = cat ? cat.id : null;

                    await run("INSERT INTO services (name, description, category_id) VALUES (?, ?, ?)",
                        [srv.name, srv.description, catId]);
                    console.log(`Service seeded: ${srv.name}`);
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

            // Service Tags (Seed links between services and tags)
            // We run this after Services and Tags are guaranteed to exist
            for (const srv of initialData.services) {
                if (srv.tags) {
                    const service = await get("SELECT id FROM services WHERE name = ?", [srv.name]);
                    if (service) {
                        for (const tagName of srv.tags) {
                            const tag = await get("SELECT id FROM tags WHERE name = ?", [tagName]);
                            if (tag) {
                                // Check if link exists
                                const linkExists = await get("SELECT * FROM service_tags WHERE service_id = ? AND tag_id = ?", [service.id, tag.id]);
                                if (!linkExists) {
                                    await run("INSERT INTO service_tags (service_id, tag_id) VALUES (?, ?)", [service.id, tag.id]);
                                    console.log(`   -> Linked service ${srv.name} to tag ${tagName}`);
                                }
                            }
                        }
                    }
                }
            }

            // Products
            for (const prod of initialData.products) {
                let prodId;
                const existingProd = await get("SELECT id FROM products WHERE name = ?", [prod.name]);

                if (!existingProd) {
                    const result = await run("INSERT INTO products (name, description, target_segment, is_in_carousel, is_top_product, price, payment_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        [prod.name, prod.description, prod.target_segment, prod.is_in_carousel, prod.is_top_product, prod.price, prod.payment_type]);
                    prodId = result.lastID;
                    console.log(`Product seeded: ${prod.name}`);

                    // Seed Product-Services (Volume)
                    if (prod.services) {
                        for (const prodSrv of prod.services) {
                            const service = await get("SELECT id FROM services WHERE name = ?", [prodSrv.name]);
                            if (service) {
                                await run("INSERT INTO product_services (product_id, service_id, quantity) VALUES (?, ?, ?)",
                                    [prodId, service.id, prodSrv.quantity]);
                                console.log(`   -> Linked service ${prodSrv.name} (Qty: ${prodSrv.quantity})`);
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
