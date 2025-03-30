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
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const monitoring_1 = __importDefault(require("./routes/monitoring"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const organizations_1 = __importDefault(require("./routes/organizations"));
const instructors_1 = __importDefault(require("./routes/instructors"));
const courseTypes_1 = __importDefault(require("./routes/courseTypes"));
const accounting_1 = __importDefault(require("./routes/accounting"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 9005;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/organizations', organizations_1.default);
app.use('/api/instructors', instructors_1.default);
app.use('/api/monitoring', monitoring_1.default);
app.use('/api/course-types', courseTypes_1.default);
app.use('/api/accounting', accounting_1.default);
// Test endpoint with DB check
app.get('/api/test', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Test database connection
        yield db_1.default.raw('SELECT 1');
        res.json({
            message: 'Server is running successfully!',
            dbStatus: 'Database connection successful'
        });
    }
    catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({
            message: 'Server is running but database connection failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Health check endpoint
app.get('/api/health', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.default.raw('SELECT 1');
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            dbStatus: 'connected'
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            dbStatus: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
// Test database connection
db_1.default.raw('SELECT 1')
    .then(() => {
    console.log('Database connected successfully');
})
    .catch((err) => {
    console.error('Database connection error:', err);
});
// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
