"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Participation = exports.ActivityPhoto = exports.UserPhoto = exports.UserPreference = exports.Message = exports.Conversation = exports.Friendship = exports.Application = exports.Activity = exports.User = exports.sequelize = void 0;
exports.initializeModels = initializeModels;
exports.testSequelizeConnection = testSequelizeConnection;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
// 模型导入
const User_1 = require("../models/User");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return User_1.User; } });
const Activity_1 = require("../models/Activity");
Object.defineProperty(exports, "Activity", { enumerable: true, get: function () { return Activity_1.Activity; } });
const Application_1 = require("../models/Application");
Object.defineProperty(exports, "Application", { enumerable: true, get: function () { return Application_1.Application; } });
const Friendship_1 = require("../models/Friendship");
Object.defineProperty(exports, "Friendship", { enumerable: true, get: function () { return Friendship_1.Friendship; } });
const Conversation_1 = require("../models/Conversation");
Object.defineProperty(exports, "Conversation", { enumerable: true, get: function () { return Conversation_1.Conversation; } });
const Message_1 = require("../models/Message");
Object.defineProperty(exports, "Message", { enumerable: true, get: function () { return Message_1.Message; } });
const UserPreference_1 = require("../models/UserPreference");
Object.defineProperty(exports, "UserPreference", { enumerable: true, get: function () { return UserPreference_1.UserPreference; } });
const UserPhoto_1 = require("../models/UserPhoto");
Object.defineProperty(exports, "UserPhoto", { enumerable: true, get: function () { return UserPhoto_1.UserPhoto; } });
const ActivityPhoto_1 = require("../models/ActivityPhoto");
Object.defineProperty(exports, "ActivityPhoto", { enumerable: true, get: function () { return ActivityPhoto_1.ActivityPhoto; } });
const Participation_1 = require("../models/Participation");
Object.defineProperty(exports, "Participation", { enumerable: true, get: function () { return Participation_1.Participation; } });
dotenv_1.default.config();
// 创建Sequelize实例
exports.sequelize = new sequelize_1.Sequelize({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME || 'hiking_app',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    dialect: 'mysql',
    logging: false, // 设置为console.log可以看到SQL语句
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});
// 初始化所有模型
function initializeModels() {
    User_1.User.initialize(exports.sequelize);
    Activity_1.Activity.initialize(exports.sequelize);
    Application_1.Application.initialize(exports.sequelize);
    Friendship_1.Friendship.initialize(exports.sequelize);
    Conversation_1.Conversation.initialize(exports.sequelize);
    Message_1.Message.initialize(exports.sequelize);
    UserPreference_1.UserPreference.initialize(exports.sequelize);
    UserPhoto_1.UserPhoto.initialize(exports.sequelize);
    ActivityPhoto_1.ActivityPhoto.initialize(exports.sequelize);
    Participation_1.Participation.initialize(exports.sequelize);
    // 设置模型关联
    User_1.User.associate?.();
    Activity_1.Activity.associate?.();
    Application_1.Application.associate?.();
    Friendship_1.Friendship.associate?.();
    Conversation_1.Conversation.associate?.();
    Message_1.Message.associate?.();
    UserPreference_1.UserPreference.associate?.();
    UserPhoto_1.UserPhoto.associate?.();
    ActivityPhoto_1.ActivityPhoto.associate?.();
    Participation_1.Participation.associate?.();
    console.log('✅ All Sequelize models initialized');
}
// 测试数据库连接
async function testSequelizeConnection() {
    try {
        await exports.sequelize.authenticate();
        console.log('✅ Sequelize database connected successfully');
        return true;
    }
    catch (error) {
        console.error('❌ Sequelize connection failed:', error);
        return false;
    }
}
//# sourceMappingURL=sequelize.js.map