const { query } = require('../config/db');
const { uploadToCloudinary } = require('../utils/cloudinary');

const getFarmerProfile = async (req, res) => {
  try {
    const id = req.params.id || req.user.id;
    const result = await query(
      `SELECT id, first_name, last_name, farmer_id, farm_name, farm_location, farm_state, farm_district,
              bio, profile_image, total_earnings, rating, total_reviews, created_at
       FROM farmers WHERE id = $1`, [id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Farmer not found' });
    res.json({ success: true, profile: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

const updateFarmerProfile = async (req, res) => {
  try {
    const { farm_name, farm_location, farm_state, farm_district, bio } = req.body;
    let profile_image = null;
    if (req.file) profile_image = await uploadToCloudinary(req.file.path, 'krishianaj/profiles', req);

    const result = await query(
      `UPDATE farmers SET farm_name = COALESCE($1, farm_name), farm_location = COALESCE($2, farm_location),
        farm_state = COALESCE($3, farm_state), farm_district = COALESCE($4, farm_district),
        bio = COALESCE($5, bio), profile_image = COALESCE($6, profile_image), updated_at = NOW()
       WHERE id = $7 RETURNING id, first_name, last_name, farmer_id, farm_name, farm_location, farm_state, farm_district, bio, profile_image`,
      [farm_name||null, farm_location||null, farm_state||null, farm_district||null, bio||null, profile_image, req.user.id]
    );
    res.json({ success: true, message: 'Profile updated', profile: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

const getConsumerProfile = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, first_name, last_name, consumer_id, profile_image, delivery_address, delivery_city, delivery_state, delivery_pincode, created_at
       FROM consumers WHERE id = $1`, [req.user.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Consumer not found' });
    res.json({ success: true, profile: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

const updateConsumerProfile = async (req, res) => {
  try {
    const { delivery_address, delivery_city, delivery_state, delivery_pincode } = req.body;
    let profile_image = null;
    if (req.file) profile_image = await uploadToCloudinary(req.file.path, 'krishianaj/profiles', req);

    const result = await query(
      `UPDATE consumers SET delivery_address = COALESCE($1, delivery_address), delivery_city = COALESCE($2, delivery_city),
        delivery_state = COALESCE($3, delivery_state), delivery_pincode = COALESCE($4, delivery_pincode),
        profile_image = COALESCE($5, profile_image), updated_at = NOW()
       WHERE id = $6 RETURNING id, first_name, last_name, consumer_id, delivery_address, delivery_city, delivery_state, delivery_pincode, profile_image`,
      [delivery_address||null, delivery_city||null, delivery_state||null, delivery_pincode||null, profile_image, req.user.id]
    );
    res.json({ success: true, message: 'Profile updated', profile: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

module.exports = { getFarmerProfile, updateFarmerProfile, getConsumerProfile, updateConsumerProfile };
