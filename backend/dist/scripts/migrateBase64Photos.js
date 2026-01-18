"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = require("../config/database");
const UploadService_1 = require("../services/UploadService");
function isHttp(url) {
    return /^https?:\/\//i.test(url);
}
function isUploadsPath(url) {
    return url.startsWith('/uploads/') || url.startsWith('uploads/');
}
function isDataUrl(url) {
    return /^data:image\/(png|jpeg|jpg|webp);base64,/i.test(url);
}
function looksLikeBase64(url) {
    // Heuristic: long string with only base64 chars
    return /^[A-Za-z0-9+/=]+$/.test(url) && url.length > 256;
}
async function ensureDir(dir) {
    await fs_1.default.promises.mkdir(dir, { recursive: true });
}
async function writeBufferToFile(buffer, filePath) {
    await ensureDir(path_1.default.dirname(filePath));
    await fs_1.default.promises.writeFile(filePath, buffer);
}
async function migrateOnePhoto(row, uploadsDir) {
    const id = row.id;
    let src = row.photo_url;
    if (!src)
        return null;
    try {
        let buffer = null;
        let ext = '.jpg';
        if (isDataUrl(src)) {
            const comma = src.indexOf(',');
            const meta = src.substring(0, comma);
            if (/png/i.test(meta))
                ext = '.png';
            else if (/webp/i.test(meta))
                ext = '.webp';
            const b64 = src.substring(comma + 1);
            buffer = Buffer.from(b64, 'base64');
        }
        else if (looksLikeBase64(src)) {
            // Assume jpeg when no metadata
            buffer = Buffer.from(src, 'base64');
        }
        else {
            return null;
        }
        const fileName = `photo-${id}-${Date.now()}${ext}`;
        const absFile = path_1.default.join(uploadsDir, 'activities', fileName);
        await writeBufferToFile(buffer, absFile);
        // Generate thumbnail
        try {
            await UploadService_1.UploadService.generateThumbnail(absFile);
        }
        catch { }
        const url = UploadService_1.UploadService.getFileUrl(absFile);
        await database_1.pool.query('UPDATE user_photos SET photo_url = ?, updated_at = NOW() WHERE id = ?', [url, id]);
        return url;
    }
    catch (err) {
        console.error('migrate photo failed:', id, err);
        return null;
    }
}
async function main() {
    const uploadsRoot = path_1.default.resolve(__dirname, '../../uploads');
    await ensureDir(path_1.default.join(uploadsRoot, 'activities'));
    const [rows] = await database_1.pool.query('SELECT id, photo_url FROM user_photos ORDER BY created_at ASC');
    let migrated = 0;
    for (const row of rows) {
        const url = row.photo_url;
        if (!url || isHttp(url) || isUploadsPath(url))
            continue;
        const result = await migrateOnePhoto(row, uploadsRoot);
        if (result) {
            migrated++;
            console.log('migrated:', row.id, '->', result);
        }
    }
    console.log(`✅ migration finished, migrated ${migrated} records`);
    process.exit(0);
}
main().catch(err => {
    console.error('migration error:', err);
    process.exit(1);
});
//# sourceMappingURL=migrateBase64Photos.js.map