const { query } = require('../config/db');
const { uploadToCloudinary } = require('../utils/cloudinary');

const getFarmerProfile = async (req, res) => {
  try {
    const id = req.params.id || req.user.id;
    const result = await query(
      `SELECT id, first_name, last_name, phone_number, farm_name, farm_location, farm_state, farm_district,
              bio, profile_image, total_earnings, rating, total_reviews, is_verified, created_at
       FROM farmers WHERE id = $1`, [id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Farmer not found' });
    res.json({ success: true, profile: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

const updateFarmerProfile = async (req, res) => {
  try {
    const { farm_name, farm_location, farm_state, farm_district, farm_pincode, bio } = req.body;
    let profile_image = null;
    if (req.file) profile_image = await uploadToCloudinary(req.file.path, 'krishianaj/profiles');

    const result = await query(
      `UPDATE farmers SET farm_name = COALESCE($1, farm_name), farm_location = COALESCE($2, farm_location),
        farm_state = COALESCE($3, farm_state), farm_district = COALESCE($4, farm_district),
        farm_pincode = COALESCE($5, farm_pincode), bio = COALESCE($6, bio),
        profile_image = COALESCE($7, profile_image), updated_at = NOW()
       WHERE id = $8 RETURNING id, first_name, last_name, farm_name, farm_state, farm_district, bio, profile_image`,
      [farm_name||null, farm_location||null, farm_state||null, farm_district||null, farm_pincode||null, bio||null, profile_image, req.user.id]
    );
    res.json({ success: true, message: 'Profile updated', profile: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

const getConsumerProfile = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, first_name, last_name, phone_number, email, profile_image, delivery_address, delivery_city, delivery_state, delivery_pincode, created_at
       FROM consumers WHERE id = $1`, [req.user.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Consumer not found' });
    res.json({ success: true, profile: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

const updateConsumerProfile = async (req, res) => {
  try {
    const { delivery_address, delivery_city, delivery_state, delivery_pincode, email } = req.body;
    let profile_image = null;
    if (req.file) profile_image = await uploadToCloudinary(req.file.path, 'krishianaj/profiles');

    const result = await query(
      `UPDATE consumers SET delivery_address = COALESCE($1, delivery_address), delivery_city = COALESCE($2, delivery_city),
        delivery_state = COALESCE($3, delivery_state), delivery_pincode = COALESCE($4, delivery_pincode),
        email = COALESCE($5, email), profile_image = COALESCE($6, profile_image), updated_at = NOW()
       WHERE id = $7 RETURNING id, first_name, last_name, phone_number, email, delivery_city, delivery_state, profile_image`,
      [delivery_address||null, delivery_city||null, delivery_state||null, delivery_pincode||null, email||null, profile_image, req.user.id]
    );
    res.json({ success: true, message: 'Profile updated', profile: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

module.exports = { getFarmerProfile, updateFarmerProfile, getConsumerProfile, updateConsumerProfile };
