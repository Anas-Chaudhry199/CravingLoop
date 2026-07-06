import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        // './public/temp' ko hata kar '/tmp' kar diya jo Vercel support karta hai
        cb(null, "/tmp")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

export const upload = multer({
    storage,
})