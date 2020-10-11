const router = require('express').Router();
const db = require('../db');
const isAuthorized = require('../middlewares/isAuthorized');
const isAdmin = require('../middlewares/isAdmin');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/listings');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + ' ' + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') cb(null, true);
  else cb(new Error('You need to upload a jpeg, jpg or png file'), false);
};
const upload = multer({ storage, fileFilter });
const listingImages = upload.array('listingImages', 4);

router.get('/', async (req, res) => {
  try {
    const { rows: listings } = await db.query('SELECT * FROM listings;');
    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Unable to get all the lisstings' });
  }
});

router.post('/add', listingImages, async (req, res) => {
  try {
    const { name, address, city, zipcode, description, deposit, bedrooms, garage, area, rent_price, square_meters, providence } = req.body;
    const photo1 = req.files[0] ? req.files[0].path : null;
    const photo2 = req.files[1] ? req.files[1].path : null;
    const photo3 = req.files[2] ? req.files[2].path : null;
    const photo4 = req.files[3] ? req.files[3].path : null;
    await db.query('INSERT INTO listings (name, address, city, zipcode, description, deposit, bedrooms, garage, area, rent_price, square_meters, providence, photo1, photo2, photo3, photo4);',
      [name, address, city, zipcode, description, deposit, bedrooms, garage, area, rent_price, square_meters, providence, photo1, photo2, photo3, photo4]
    );
    res.sensStatus(203);
  } catch (error) {
    res.json({ message: error.message });
  }
});

module.exports = router;