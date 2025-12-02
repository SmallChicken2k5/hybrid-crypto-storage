const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    originalName: String,
    encryptedName: String, // tên file lưu trên server
    size: Number,
    mimeType: String,
    encryptedAESKey: String, // AES key đã mã hóa bằng RSA
    iv: String, // Initialization Vector cho AES
    uploadPath: String,
    deleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema, 'files');