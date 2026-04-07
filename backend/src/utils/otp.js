const { query } = require('../config/db');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const saveOTP = async (phoneNumber, otpCode, purpose, userType) => {
  await query(`UPDATE otps SET is_used = TRUE WHERE phone_number = $1 AND purpose = $2 AND is_used = FALSE`, [phoneNumber, purpose]);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await query(`INSERT INTO otps (phone_number, otp_code, purpose, user_type, expires_at) VALUES ($1, $2, $3, $4, $5)`,
    [phoneNumber, otpCode, purpose, userType, expiresAt]);
};

const verifyOTP = async (phoneNumber, otpCode, purpose) => {
  const result = await query(
    `SELECT * FROM otps WHERE phone_number = $1 AND otp_code = $2 AND purpose = $3 AND is_used = FALSE AND expires_at > NOW() AND attempts < 5 ORDER BY created_at DESC LIMIT 1`,
    [phoneNumber, otpCode, purpose]
  );
  if (result.rows.length === 0) {
    await query(`UPDATE otps SET attempts = attempts + 1 WHERE phone_number = $1 AND purpose = $2 AND is_used = FALSE`, [phoneNumber, purpose]);
    return false;
  }
  await query(`UPDATE otps SET is_used = TRUE WHERE id = $1`, [result.rows[0].id]);
  return true;
};

const sendOTPSMS = async (phoneNumber, otp) => {
  console.log(`[DEV] OTP for ${phoneNumber}: ${otp}`);
  return true;
};

module.exports = { generateOTP, saveOTP, verifyOTP, sendOTPSMS };
