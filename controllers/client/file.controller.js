const File = require('../../models/file.model');
const User = require('../../models/user.model');
const cryptoHelper = require('../../helpers/crypto.helper');
const fs = require('fs');
const path = require('path');

// [GET] /files
module.exports.index = async (req, res) => {
    const files = await File.find({ 
        userId: req.session.userId,
        deleted: false 
    });
    
    res.render('client/pages/files/index', { 
        title: 'Quản lý File',
        files,
        userId: req.session.userId
    });
};

// [GET] /files/upload
module.exports.upload = (req, res) => {
    res.render('client/pages/files/upload', { 
        title: 'Upload File',
        userId: req.session.userId
    });
};

// [POST] /files/upload
module.exports.uploadPost = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const fileBuffer = req.file.buffer;
        
        // 1. Mã hóa file bằng AES
        const { encryptedData, aesKey, iv } = cryptoHelper.encryptFileAES(fileBuffer);
        
        // 2. Mã hóa AES key bằng RSA Public Key
        const encryptedAESKey = cryptoHelper.encryptAESKeyWithRSA(aesKey, user.publicKey);
        
        // 3. Lưu file đã mã hóa
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        const encryptedFileName = Date.now() + '-encrypted.bin';
        const uploadPath = path.join(uploadDir, encryptedFileName);
        fs.writeFileSync(uploadPath, encryptedData);
        
        // 4. Lưu metadata vào database
        const file = new File({
            userId: user.id,
            originalName: req.file.originalname,
            encryptedName: encryptedFileName,
            size: req.file.size,
            mimeType: req.file.mimetype,
            encryptedAESKey,
            iv,
            uploadPath
        });
        
        await file.save();
        
        req.flash('success', 'Upload file thành công!');
        res.redirect('/files');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Upload thất bại!');
        res.redirect('back');
    }
};

// [GET] /files/download/:id
module.exports.download = async (req, res) => {
    try {
        const file = await File.findOne({ 
            _id: req.params.id,
            userId: req.session.userId,
            deleted: false
        });
        
        if (!file) {
            return res.status(404).send('File không tồn tại');
        }
        
        const user = await User.findById(req.session.userId);
        
        // 1. Đọc file đã mã hóa
        const encryptedBuffer = fs.readFileSync(file.uploadPath);
        
        // 2. Giải mã AES key bằng RSA Private Key
        const aesKey = cryptoHelper.decryptAESKeyWithRSA(
            file.encryptedAESKey,
            user.privateKey
        );
        
        // 3. Giải mã file bằng AES
        const decryptedBuffer = cryptoHelper.decryptFileAES(
            encryptedBuffer,
            aesKey,
            file.iv
        );
        
        // 4. Trả file về cho user
        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        res.send(decryptedBuffer);
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi download file');
    }
};

// [POST] /files/delete/:id
module.exports.delete = async (req, res) => {
    await File.updateOne(
        { _id: req.params.id },
        { deleted: true }
    );
    
    req.flash('success', 'Xóa file thành công!');
    res.redirect('/files');
};