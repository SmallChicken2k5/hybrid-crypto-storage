// [GET] /
module.exports.index = (req, res) => {
    res.render('client/pages/home', { 
        title: 'Home Page',
        userId: req.session.userId
    });
}
// [GET] /about
module.exports.about = (req, res) => {
    res.render('client/pages/home/about', { 
        title: 'About Us',
        userId: req.session.userId
    });
}