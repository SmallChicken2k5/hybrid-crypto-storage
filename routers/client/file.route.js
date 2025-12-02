const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middlware');
const controller = require('../../controllers/client/file.controller');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });
router.use(authMiddleware.requireAuth);
router.get('/', controller.index);
router.get('/upload', controller.upload);
router.post('/upload', upload.single('file'), controller.uploadPost);
router.get('/download/:id', controller.download);
router.delete('/delete/:id', controller.delete);

module.exports = router;