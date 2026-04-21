const { query } = require('../config/db');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Create listing
const createListing = async (req, res) => {
  try {
    const farmer_id = req.user.id;
    const { crop_name, category, description, quantity, unit, price_per_unit, min_order_quantity,
      harvest_date, available_until, quality_grade, organic, location, state, district, pincode } = req.body;

    if (!crop_name || !category || !quantity || !unit || !price_per_unit)
      return res.status(400).json({ success: false, message: 'Required fields missing' });

    let images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.path, 'krishianaj/crops', req);
        images.push(url);
      }
    }

    const result = await query(
      `INSERT INTO crop_listings (farmer_id, crop_name, category, description, quantity, unit, price_per_unit,
        min_order_quantity, harvest_date, available_until, quality_grade, organic, images, location, state, district, pincode)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
      [farmer_id, crop_name, category, description || null, parseFloat(quantity), unit, parseFloat(price_per_unit),
        parseFloat(min_order_quantity) || 1, harvest_date || null, available_until || null,
        quality_grade || 'A', organic === 'true' || organic === true, images,
        location || null, state || null, district || null, pincode || null]
    );

    res.status(201).json({ success: true, message: 'Crop listed successfully', listing: result.rows[0] });
  } catch (err) {
    console.error('createListing error:', err);
    if (err.message === 'Only image files are allowed') {
      return res.status(400).json({ success: false, message: err.message });
    }

    res.status(500).json({ success: false, message: 'Failed to create listing' });
  }
};

// Get all listings (consumer browse)
const getListings = async (req, res) => {
  try {
    const { category, state, district, min_price, max_price, organic, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    let conditions = [`cl.is_available = TRUE`, `cl.is_active = TRUE`];
    let params = [];
    let idx = 1;

    if (category) { conditions.push(`cl.category ILIKE $${idx++}`); params.push(`%${category}%`); }
    if (state) { conditions.push(`cl.state ILIKE $${idx++}`); params.push(`%${state}%`); }
    if (district) { conditions.push(`cl.district ILIKE $${idx++}`); params.push(`%${district}%`); }
    if (min_price) { conditions.push(`cl.price_per_unit >= $${idx++}`); params.push(parseFloat(min_price)); }
    if (max_price) { conditions.push(`cl.price_per_unit <= $${idx++}`); params.push(parseFloat(max_price)); }
    if (organic === 'true') { conditions.push(`cl.organic = TRUE`); }
    if (search) { conditions.push(`(cl.crop_name ILIKE $${idx++} OR cl.description ILIKE $${idx++})`); params.push(`%${search}%`, `%${search}%`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(parseInt(limit), parseInt(offset));

    const countResult = await query(`SELECT COUNT(*) FROM crop_listings cl ${where}`, params.slice(0, -2));
    const listingsResult = await query(
      `SELECT cl.*, f.first_name || ' ' || f.last_name AS farmer_name, f.farm_name, f.rating AS farmer_rating, f.farm_state
       FROM crop_listings cl
       JOIN farmers f ON cl.farmer_id = f.id
       ${where}
       ORDER BY cl.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );

    res.json({ success: true, listings: listingsResult.rows, total: parseInt(countResult.rows[0].count), page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('getListings error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch listings' });
  }
};

// Get single listing
const getListing = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT cl.*, f.first_name || ' ' || f.last_name AS farmer_name, f.farm_name, f.farm_location, f.farm_state, f.farm_district,
              f.rating AS farmer_rating, f.total_reviews AS farmer_reviews, f.bio AS farmer_bio, f.profile_image AS farmer_image
       FROM crop_listings cl
       JOIN farmers f ON cl.farmer_id = f.id
       WHERE cl.id = $1 AND cl.is_active = TRUE`, [id]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Listing not found' });

    const reviews = await query(
      `SELECT r.*, c.first_name || ' ' || c.last_name AS consumer_name FROM reviews r
       JOIN consumers c ON r.consumer_id = c.id
       WHERE r.listing_id = $1 AND r.is_active = TRUE ORDER BY r.created_at DESC LIMIT 5`, [id]
    );

    res.json({ success: true, listing: result.rows[0], reviews: reviews.rows });
  } catch (err) {
    console.error('getListing error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch listing' });
  }
};

// Get farmer's own listings
const getFarmerListings = async (req, res) => {
  try {
    const farmer_id = req.user.id;
    const result = await query(`SELECT * FROM crop_listings WHERE farmer_id = $1 AND is_active = TRUE ORDER BY created_at DESC`, [farmer_id]);
    res.json({ success: true, listings: result.rows });
  } catch (err) {
    console.error('getFarmerListings error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch listings' });
  }
};

// Update listing
const updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const farmer_id = req.user.id;
    const { quantity, price_per_unit, category, is_available, description, available_until } = req.body;

    const existing = await query(`SELECT * FROM crop_listings WHERE id = $1 AND farmer_id = $2`, [id, farmer_id]);
    if (!existing.rows[0]) return res.status(404).json({ success: false, message: 'Listing not found or unauthorized' });

    const result = await query(
      `UPDATE crop_listings SET quantity = COALESCE($1, quantity), price_per_unit = COALESCE($2, price_per_unit),
        category = COALESCE($3, category), is_available = COALESCE($4, is_available), description = COALESCE($5, description),
        available_until = COALESCE($6, available_until), updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [quantity ? parseFloat(quantity) : null, price_per_unit ? parseFloat(price_per_unit) : null,
        category || null, is_available !== undefined ? is_available : null, description || null, available_until || null, id]
    );

    res.json({ success: true, message: 'Listing updated', listing: result.rows[0] });
  } catch (err) {
    console.error('updateListing error:', err);
    res.status(500).json({ success: false, message: 'Failed to update listing' });
  }
};

// Delete listing
const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    await query(`UPDATE crop_listings SET is_active = FALSE WHERE id = $1 AND farmer_id = $2`, [id, req.user.id]);
    res.json({ success: true, message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete listing' });
  }
};

// Get categories
const getCategories = async (req, res) => {
  try {
    const result = await query(`SELECT DISTINCT category, COUNT(*) as count FROM crop_listings WHERE is_available = TRUE AND is_active = TRUE GROUP BY category ORDER BY count DESC`);
    res.json({ success: true, categories: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

module.exports = { createListing, getListings, getListing, getFarmerListings, updateListing, deleteListing, getCategories };
