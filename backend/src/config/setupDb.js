const { pool } = require('./db');

const setupDatabase = async () => {
  const client = await pool.connect();
  try {
    console.log('Setting up KrishiAnaj database...');
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS farmers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        farmer_id VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        profile_image TEXT,
        farm_name VARCHAR(200),
        farm_location TEXT,
        farm_state VARCHAR(100),
        farm_district VARCHAR(100),
        bio TEXT,
        total_earnings DECIMAL(12,2) DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0,
        total_reviews INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS consumers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        consumer_id VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        profile_image TEXT,
        delivery_address TEXT,
        delivery_city VARCHAR(100),
        delivery_state VARCHAR(100),
        delivery_pincode VARCHAR(10),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`ALTER TABLE consumers ADD COLUMN IF NOT EXISTS consumer_id VARCHAR(50);`);
    await client.query(`UPDATE consumers SET consumer_id = 'CON-' || SUBSTRING(id::TEXT, 1, 8) WHERE consumer_id IS NULL;`);
    await client.query(`ALTER TABLE consumers ALTER COLUMN consumer_id SET NOT NULL;`);
    await client.query(`ALTER TABLE consumers ADD CONSTRAINT consumers_consumer_id_key UNIQUE (consumer_id);`).catch(() => {});
    await client.query(`ALTER TABLE farmers DROP COLUMN IF EXISTS phone_number CASCADE;`);
    await client.query(`ALTER TABLE consumers DROP COLUMN IF EXISTS phone_number CASCADE;`);
    await client.query(`ALTER TABLE consumers DROP COLUMN IF EXISTS email CASCADE;`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS crop_listings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
        crop_name VARCHAR(200) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        quantity DECIMAL(10,2) NOT NULL,
        unit VARCHAR(20) NOT NULL DEFAULT 'kg',
        price_per_unit DECIMAL(10,2) NOT NULL,
        min_order_quantity DECIMAL(10,2) DEFAULT 1,
        harvest_date DATE,
        available_until DATE,
        quality_grade VARCHAR(10) DEFAULT 'A',
        organic BOOLEAN DEFAULT FALSE,
        images TEXT[],
        location TEXT,
        state VARCHAR(100),
        district VARCHAR(100),
        pincode VARCHAR(10),
        total_sold DECIMAL(10,2) DEFAULT 0,
        is_available BOOLEAN DEFAULT TRUE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_number VARCHAR(20) UNIQUE NOT NULL,
        consumer_id UUID NOT NULL REFERENCES consumers(id) ON DELETE CASCADE,
        farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
        listing_id UUID NOT NULL REFERENCES crop_listings(id) ON DELETE CASCADE,
        quantity DECIMAL(10,2) NOT NULL,
        unit VARCHAR(20) NOT NULL,
        price_per_unit DECIMAL(10,2) NOT NULL,
        total_amount DECIMAL(12,2) NOT NULL,
        delivery_address TEXT NOT NULL,
        delivery_city VARCHAR(100),
        delivery_state VARCHAR(100),
        delivery_pincode VARCHAR(10),
        status VARCHAR(30) DEFAULT 'pending',
        payment_method VARCHAR(30),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        consumer_id UUID NOT NULL REFERENCES consumers(id) ON DELETE CASCADE,
        farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
        listing_id UUID NOT NULL REFERENCES crop_listings(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`DROP TABLE IF EXISTS otps CASCADE;`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        consumer_id UUID NOT NULL REFERENCES consumers(id) ON DELETE CASCADE,
        listing_id UUID NOT NULL REFERENCES crop_listings(id) ON DELETE CASCADE,
        quantity DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(consumer_id, listing_id)
      );
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_listings_farmer ON crop_listings(farmer_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_listings_category ON crop_listings(category);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_listings_state ON crop_listings(state);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_consumer ON orders(consumer_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_farmer ON orders(farmer_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_reviews_farmer ON reviews(farmer_id);`);

    console.log('All tables created successfully!');
    console.log('KrishiAnaj database is ready!');
  } catch (err) {
    console.error('Database setup failed:', err);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
};

setupDatabase().catch(console.error);
