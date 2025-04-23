import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/tmp');  // trc la ./upload doi de su dung tren vercel
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + uuidv4() + '-' + Date.now() );
    },
});

const upload = multer({ storage: storage });

export default upload;
