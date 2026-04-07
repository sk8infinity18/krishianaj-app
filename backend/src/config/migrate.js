const pool = require('./database');
require('dotenv').config();

const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Enable UUID extension
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Users table (both farmers and consumers)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        phone_number VARCHAR(15) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('farmer', 'consumer')),
        profile_image_url TEXT,
        address TEXT,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        is_verified BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Farmer profiles (extended info for farmers)
    await client.query(`
      CREATE TABLE IF NOT EXISTS farmer_profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        farmer_id VARCHAR(100) UNIQUE NOT NULL,
        farm_name VARCHAR(200),
        farm_size_acres DECIMAL(10, 2),
        farm_location TEXT,
        farm_latitude DECIMAL(10, 8),
        farm_longitude DECIMAL(11, 8),
        farming_type VARCHAR(100),
        bio TEXT,
        bank_account_number VARCHAR(50),
        ifsc_code VARCHAR(20),
        total_earnings DECIMAL(12, 2) DEFAULT 0,
        rating DECIMAL(3, 2) DEFAULT 0,
        total_ratings INTEGER DEFAULT 0,
        is_verified_farmer BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crop categories
    await client.query(`
      CREATE TABLE IF NOT EXISTS crop_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        icon VARCHAR(50),
        description TEXT
      )
    `);

    // Insert default categories
    await client.query(`
      INSERT INTO crop_categories (name, icon, description) VALUES
        ('Vegetables', '🥦', 'Fresh vegetables from farms'),
        ('Fruits', '🍎', 'Seasonal and exotic fruits'),
        ('Grains & Cereals', '🌾', 'Rice, wheat, millets and more'),
        ('Pulses & Legumes', '🫘', 'Lentils, beans, chickpeas'),
        ('Spices & Herbs', '🌿', 'Aromatic spices and herbs'),
        ('Dairy & Poultry', '🥛', 'Milk, eggs and dairy products'),
        ('Flowers', '🌸', 'Fresh cut flowers and plants'),
        ('Oil Seeds', '🌻', 'Groundnut, sunflower, mustard seeds'),
        ('Organic', '🌱', 'Certified organic produce')
      ON CONFLICT (name) DO NOTHING
    `);

    // Crop listings
    await client.query(`
      CREATE TABLE IF NOT EXISTS crop_listings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES crop_categories(id),
        crop_name VARCHAR(200) NOT NULL,
        description TEXT,
        quantity_available DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(50) NOT NULL DEFAULT 'kg',
        price_per_unit DECIMAL(10, 2) NOT NULL,
        minimum_order_quantity DECIMAL(10, 2) DEFAULT 1,
        harvest_date DATE,
        available_from DATE,
        available_until DATE,
        quality_grade VARCHAR(20) CHECK (quality_grade IN ('A', 'B', 'C', 'Premium')),
        is_organic BOOLEAN DEFAULT FALSE,
        is_available BOOLEAN DEFAULT TRUE,
        location TEXT,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        views_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crop images
    await client.query(`
      CREATE TABLE IF NOT EXISTS crop_images (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        listing_id UUID NOT NULL REFERENCES crop_listings(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        consumer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (
          status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'refunded')
        ),
        total_amount DECIMAL(12, 2) NOT NULL,
        delivery_address TEXT,
        delivery_latitude DECIMAL(10, 8),
        delivery_longitude DECIMAL(11, 8),
        delivery_notes TEXT,
        payment_status VARCHAR(30) DEFAULT 'pending' CHECK (
          payment_status IN ('pending', 'paid', 'failed', 'refunded')
        ),
        payment_method VARCHAR(50) DEFAULT 'cod',
        payment_reference VARCHAR(200),
        estimated_delivery_date TIMESTAMP WITH TIME ZONE,
        delivered_at TIMESTAMP WITH TIME ZONE,
        cancellation_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order items
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        listing_id UUID NOT NULL REFERENCES crop_listings(id),
        crop_name VARCHAR(200) NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        price_per_unit DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(12, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Cart items
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        consumer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        listing_id UUID NOT NULL REFERENCES crop_listings(id) ON DELETE CASCADE,
        quantity DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(consumer_id, listing_id)
      )
    `);

    // Reviews & Ratings
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        consumer_id UUID NOT NULL REFERENCES users(id),
        farmer_id UUID NOT NULL REFERENCES users(id),
        listing_id UUID NOT NULL REFERENCES crop_listings(id),
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        title VARCHAR(200),
        comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // OTP table for password recovery
    await client.query(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        phone_number VARCHAR(15) NOT NULL,
        otp_code VARCHAR(6) NOT NULL,
        purpose VARCHAR(30) DEFAULT 'password_reset',
        is_used BOOLEAN DEFAULT FALSE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Notifications
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50),
        is_read BOOLEAN DEFAULT FALSE,
        data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for performance
    await client.query(`CREATE INDEX IF NOT EXISTS idx_crop_listings_farmer ON crop_listings(farmer_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_crop_listings_category ON crop_listings(category_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_crop_listings_available ON crop_listings(is_available)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_consumer ON orders(consumer_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_farmer ON orders(farmer_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)`);

    await client.query('COMMIT');
    console.log('✅ All tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
};

createTables().catch(console.error);
