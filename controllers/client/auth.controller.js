const md5 = require('md5');
const User = require('../../models/user.model');
const cryptoHelper = require('../../helpers/crypto.helper');

// [GET] /auth/register
module.exports.register = (req, res) => {
    res.render('client/pages/auth/register', { title: 'Đăng ký' });
};

// [POST] /auth/register
module.exports.registerPost = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        
        // Kiểm tra email đã tồn tại
        const existUser = await User.findOne({ email, deleted: false });
        if (existUser) {
            req.flash('error', 'Email đã tồn tại!');
            return res.redirect('back');
        }
        
        // Tạo RSA key pair
        const { publicKey, privateKey } = cryptoHelper.generateRSAKeyPair();
        
        // Lưu user
        const user = new User({
            fullName,
            email,
            password: md5(password),
            publicKey,
            privateKey
        });
        
        await user.save();
        
        req.flash('success', 'Đăng ký thành công!');
        res.redirect('/auth/login');
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra!');
        res.redirect('back');
    }
};

// [GET] /auth/login
module.exports.login = (req, res) => {
    res.render('client/pages/auth/login', { title: 'Đăng nhập' });
};

// [POST] /auth/login
module.exports.loginPost = async (req, res) => {
    const { email, password } = req.body;
    
    const user = await User.findOne({ 
        email, 
        password: md5(password),
        deleted: false 
    });
    
    if (!user) {
        req.flash('error', 'Email hoặc mật khẩu không đúng!');
        return res.redirect('back');
    }
    
    req.session.userId = user.id;
    req.flash('success', `Chào mừng ${user.fullName}!`);
    res.redirect('/files');
};

// [GET] /auth/logout
module.exports.logout = (req, res) => {
    req.session.destroy();
    req.flash('success', 'Đăng xuất thành công!');
    res.redirect('/auth/login');
};