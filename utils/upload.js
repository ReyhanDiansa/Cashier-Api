const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './product-foto';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, path.join(__dirname, '../product-foto'));
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        const filename = path.basename(file.originalname, extension);

        const timestamp = Date.now(); 
        const newFilename = `${filename}_${timestamp}${extension}`;

        cb(null, newFilename);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const acceptedType = ['image/jpg', 'image/jpeg', 'image/png'];
        if (!acceptedType.includes(file.mimetype)) {
            cb(null, false);
            return cb(`Invalid file type (${file.mimetype})`);
        }

        const filesize = req.headers['content-length'];
        const maxSize = 1 * 1024 * 1024; // 1 MB
        if (filesize > maxSize) {
            cb(null, false);
            return cb(`File size is too large`);
        }
        cb(null, true);
    }
});

module.exports = upload;
