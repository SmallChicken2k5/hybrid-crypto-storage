const crypto = require('crypto');

// Tạo cặp RSA key
module.exports.generateRSAKeyPair = () => {
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
};

// Mã hóa file bằng AES-256
module.exports.encryptFileAES = (buffer) => {
    const aesKey = crypto.randomBytes(32); // 256-bit key
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    
    return {
        encryptedData: encrypted,
        aesKey: aesKey.toString('hex'),
        iv: iv.toString('hex')
    };
};

// Giải mã file bằng AES-256
module.exports.decryptFileAES = (encryptedBuffer, aesKey, iv) => {
    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(aesKey, 'hex'),
        Buffer.from(iv, 'hex')
    );
    return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
};

// Mã hóa AES key bằng RSA Public Key
module.exports.encryptAESKeyWithRSA = (aesKey, publicKey) => {
    return crypto.publicEncrypt(
        { key: publicKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
        Buffer.from(aesKey, 'hex')
    ).toString('base64');
};

// Giải mã AES key bằng RSA Private Key
module.exports.decryptAESKeyWithRSA = (encryptedAESKey, privateKey) => {
    return crypto.privateDecrypt(
        { key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING },
        Buffer.from(encryptedAESKey, 'base64')
    ).toString('hex');
};