/**
 * Auth Router
 * Handles authentication endpoints
 */
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { jwtSecret } = require('../config/environment');
const { getMongoStatus } = require('../config/database');
const { User } = require('../models');
const { verifyToken } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { isValidEmail, isValidPassword } = require('../utils/validators');
const store = require('../data/inMemoryStore');

// POST /signup
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return sendError(res, "Please provide all required fields.", 400);
        }

        if (!isValidEmail(email)) {
            return sendError(res, "Invalid email format.", 400);
        }

        if (!isValidPassword(password)) {
            return sendError(res, "Password must be at least 6 characters.", 400);
        }

        const normalizedEmail = email.toLowerCase().trim();
        const hashedPassword = await bcrypt.hash(password, 10);
        const role = 'user'; // Always set to 'user' for security

        if (getMongoStatus()) {
            const existing = await User.findOne({ email: normalizedEmail });
            if (existing) {
                return sendError(res, "Email already registered.", 400);
            }
            const newUser = new User({ name, email: normalizedEmail, password: hashedPassword, role });
            await newUser.save();
            const token = jwt.sign({ id: newUser._id, email: newUser.email, role: newUser.role }, jwtSecret, { expiresIn: "7d" });
            return sendSuccess(res, { token, user: { name: newUser.name, email: newUser.email, role: newUser.role } }, 201);
        } else {
            const existing = store.users.find(u => u.email === normalizedEmail);
            if (existing) {
                return sendError(res, "Email already registered.", 400);
            }
            const mockId = Math.random().toString(36).substr(2, 9);
            const newUser = { id: mockId, name, email: normalizedEmail, password: hashedPassword, role };
            store.users.push(newUser);
            const token = jwt.sign({ id: mockId, email: normalizedEmail, role: newUser.role }, jwtSecret, { expiresIn: "7d" });
            return sendSuccess(res, { token, user: { name: newUser.name, email: newUser.email, role: newUser.role } }, 201);
        }
    } catch (error) {
        console.error("Signup Error:", error);
        return sendError(res, "Internal server error during registration.", 500);
    }
});

// POST /login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return sendError(res, "Email and password are required.", 400);
        }

        const normalizedEmail = email.toLowerCase().trim();

        if (getMongoStatus()) {
            const user = await User.findOne({ email: normalizedEmail });
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return sendError(res, "Invalid email or password.", 401);
            }
            const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, jwtSecret, { expiresIn: "7d" });
            return sendSuccess(res, { token, user: { name: user.name, email: user.email, role: user.role } });
        } else {
            const user = store.users.find(u => u.email === normalizedEmail);
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return sendError(res, "Invalid email or password.", 401);
            }
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: "7d" });
            return sendSuccess(res, { token, user: { name: user.name, email: user.email, role: user.role } });
        }
    } catch (error) {
        console.error("Login Error:", error);
        return sendError(res, "Internal server error during login.", 500);
    }
});

// POST /forgot-password
router.post('/forgot-password', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return sendError(res, "Email is required.", 400);
    }
    return sendSuccess(res, { message: "Password reset link has been dispatched to " + email });
});

// GET /me
router.get('/me', verifyToken, async (req, res) => {
    try {
        if (getMongoStatus()) {
            const user = await User.findById(req.user.id).select("-password");
            if (!user) return sendError(res, "User not found.", 404);
            return sendSuccess(res, { user });
        } else {
            const user = store.users.find(u => u.id === req.user.id);
            if (!user) return sendError(res, "User not found.", 404);
            return sendSuccess(res, { user: { name: user.name, email: user.email, role: user.role } });
        }
    } catch (error) {
        return sendError(res, "Error identifying active user.", 500);
    }
});

module.exports = router;
