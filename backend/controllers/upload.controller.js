const multer = require('multer')
const catchAsync = require('../utils/catchAsync');
const config = require('../config/config');

const { cloud_name, api_key, api_secret } = config.cloudinary;

// MULTER
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        console.log(file)
        cb(null, file.originalname)
    }
})

const uploadImage = catchAsync(async (req, res) => {
    const upload = multer({ storage }).single('image')
    upload(req, res, function (err) {
        if (err) {
            return res.send(err)
        }

        const cloudinary = require('cloudinary').v2
        cloudinary.config({
            cloud_name: cloud_name,
            api_key: api_key,
            api_secret: api_secret
        })

        const path = req.file.path
        const uniqueFilename = new Date().toISOString()

        cloudinary.uploader.upload(
            path,
            { public_id: `profile/${uniqueFilename}`, tags: `profile` }, // directory and tags are optional
            function (err, image) {
                if (err) return res.send(err)
                console.log('file uploaded to Cloudinary')
                // remove file from server
                const fs = require('fs')
                fs.unlinkSync(path)
                // return image details
                res.json(image)
            }
        )
    })
});

module.exports = {
    uploadImage
}