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
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../db");
function seedAdmin() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('🌱 Seeding admin user...');
            // Check if admin user already exists
            const adminCheck = yield db_1.pool.query('SELECT * FROM users WHERE email = $1', ['admin@example.com']);
            if (adminCheck.rows.length > 0) {
                console.log('✅ Admin user already exists');
                return;
            }
            // Create admin user
            const hashedPassword = yield bcrypt_1.default.hash('admin123', 10);
            const result = yield db_1.pool.query('INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *', ['admin@example.com', hashedPassword, 'sysAdmin']);
            console.log('✅ Admin user created:', result.rows[0]);
        }
        catch (error) {
            console.error('❌ Error seeding admin user:', error);
            process.exit(1);
        }
        finally {
            yield db_1.pool.end();
        }
    });
}
seedAdmin();
