// controllers/user/forgotPassword.js
// Reset a user's password using email + employeeId verification.
// No email sending required — user provides new password directly.

const User   = require('../../models/userModel');
const bcrypt = require('bcrypt');

const forgotPassword = async (req, res) => {
  try {
    const { email, employeeId, newPassword } = req.body;

    if (!email || !employeeId || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, Employee ID, and new password are required.',
      });
    }

    // Validate company email
    if (!email.toLowerCase().endsWith('@gainwellengineering.com')) {
      return res.status(400).json({
        success: false,
        message: 'Only @gainwellengineering.com email addresses are allowed.',
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain uppercase, lowercase, and a number.',
      });
    }

    // Find user matching BOTH email and employeeId
    const user = await User.findOne({
      email:      email.toLowerCase().trim(),
      employeeId: employeeId.toUpperCase().trim(),
    });

    if (!user) {
      // Generic message — don't reveal which field was wrong
      return res.status(404).json({
        success: false,
        message: 'No account found matching that Email and Employee ID combination.',
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password updated successfully. Please log in.' });
  } catch (error) {
    console.error('forgotPassword error:', error);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

module.exports = forgotPassword;
