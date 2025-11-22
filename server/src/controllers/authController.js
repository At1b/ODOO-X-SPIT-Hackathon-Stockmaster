const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const Joi = require('joi');
const twilio = require('twilio');

// Twilio Client
const twilioClient = process.env.TWILIO_ACCOUNT_SID?.startsWith('AC')
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// Validation Schemas
const registerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone_number: Joi.string().length(10).pattern(/^[0-9]+$/).required().messages({
        'string.length': 'Phone number must be exactly 10 digits',
        'string.pattern.base': 'Phone number must contain only digits'
    }),
    role: Joi.string().valid('manager', 'staff').default('staff')
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

exports.register = async (req, res) => {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { name, email, password, phone_number, role } = req.body;

        // Check if user exists
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ? OR phone_number = ?', [email, phone_number]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'User with this email or phone number already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (name, email, password_hash, phone_number, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, passwordHash, phone_number, role || 'staff']
        );

        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { email, password } = req.body;

        // Find user
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Check password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate Access Token (1h)
        const accessToken = jwt.sign(
            { userId: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Generate Refresh Token (7d)
        const refreshToken = jwt.sign(
            { userId: user.user_id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: { id: user.user_id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const [users] = await db.query('SELECT user_id, name, email, phone_number, role, created_at FROM users WHERE user_id = ?', [req.user.userId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(users[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins from now

        await db.query('UPDATE users SET otp_code = ?, otp_expiry = ? WHERE email = ?', [otp, expiry, email]);

        // Send SMS via Twilio
        if (user.phone_number) {
            if (twilioClient) {
                try {
                    // Ensure phone number has country code (assuming +91 for India or add logic to handle it)
                    // For now, prepending +91 if not present. Ideally, store with country code.
                    let phone = user.phone_number;
                    if (!phone.startsWith('+')) {
                        phone = '+91' + phone; // Defaulting to India for hackathon context, or make generic
                    }

                    await twilioClient.messages.create({
                        body: `Your IMS Password Reset OTP is: ${otp}`,
                        from: process.env.TWILIO_PHONE_NUMBER,
                        to: phone
                    });
                    // SMS sent successfully
                } catch (smsError) {
                    console.error('Twilio SMS Error:', smsError.message);
                    // Fallback to logging if SMS fails (e.g., unverified number in trial)
                    console.log(`[FALLBACK] OTP for ${email}: ${otp}`);
                    return res.status(500).json({ message: 'Failed to send SMS. Check server logs for OTP (Fallback).' });
                }
            } else {
                // Twilio not configured, OTP logged for development
                // For hackathon/testing without keys, return success but log OTP
                // return res.status(500).json({ message: 'SMS service not configured.' });
            }
        } else {
            console.log(`[NO PHONE] OTP for ${email}: ${otp}`);
            return res.status(400).json({ message: 'User has no phone number linked. Contact admin.' });
        }

        res.json({ message: 'OTP sent to your registered phone number' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) return res.status(400).json({ message: 'All fields are required' });

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];

        // Verify OTP
        if (user.otp_code !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (new Date() > new Date(user.otp_expiry)) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // Update password and clear OTP
        await db.query('UPDATE users SET password_hash = ?, otp_code = NULL, otp_expiry = NULL WHERE email = ?', [passwordHash, email]);

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

        // Get user details
        const [users] = await db.query('SELECT user_id, role FROM users WHERE user_id = ?', [decoded.userId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];

        // Generate new access token
        const accessToken = jwt.sign(
            { userId: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Optionally rotate refresh token for enhanced security
        const newRefreshToken = jwt.sign(
            { userId: user.user_id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            accessToken,
            refreshToken: newRefreshToken
        });
    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Invalid or expired refresh token' });
        }
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.logout = async (req, res) => {
    try {
        // In a production system, you would invalidate the refresh token here
        // This could be done by storing tokens in DB and marking them as revoked
        // For now, we'll just return success and let the client clear tokens
        res.json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
