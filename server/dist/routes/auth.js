"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const router = express_1.default.Router();
// Login route
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find user by email
        const result = yield db_1.pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // Check password
        const validPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            role: user.role,
            email: user.email,
            organizationId: user.organization_id
        }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                organizationId: user.organization_id
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error during login' });
    }
}));
exports.default = router;
