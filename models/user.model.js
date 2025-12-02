const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }, // bcrypt hash
    publicKey: String,  // RSA Public Key (PEM format)
    privateKey: String, // RSA Private Key (PEM format, mã hóa bằng password)
    deleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema, 'users');