const router = require('express').Router();
const db = require('../db');
const isAuthorized = require('../middlewares/isAuthorized');
const isAdmin = require('../middlewares/isAdmin');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/realtors');
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
const realtorImage = upload.single('realtorImage');

router.get('/', isAuthorized, isAdmin, async (req, res) => {
  try {
    const { rows: realtors } = await db.query('SELECT * FROM realtors;');
    res.status(200).json(realtors);
  } catch (error) {
    res.status(500).json({ message: 'Unable to get all the realtors' });
  }
});

router.post('/add', isAuthorized, isAdmin, realtorImage, async (req, res) => {
  try {
    const photo = req.file.path;
    const { name, email, phone, description, hireDate } = req.body;
    await db.query('INSERT INTO realtors (name, email, phone, photo, description, hire_date) VALUES ($1, $2, $3, $4, $5, $6);',
      [name, email, phone, photo, description, hireDate]);
    res.sendStatus(203);
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.delete('/delete/:realtorId', isAuthorized, isAdmin, async (req, res) => {
  try {
    const { rows: realtor } = await db.query('SELECT * FROM realtors WHERE id = $1;', [req.params.realtorId]);
    fs.unlinkSync(path.join(`${__dirname}/../${realtor[0].photo}`));
    await db.query('DELETE FROM realtors WHERE id = $1;', [req.params.realtorId]);
    res.sendStatus(203);
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.put('/update/:realtorId', isAuthorized, isAdmin, async (req, res) => {
  try {
    await db.query(
      'UPDATE realtors SET name = $1, email = $2, phone = $3, photo = $4, description = $5, hire_date = $6 WHERE id = $7;',
      [name, email, phone, photo, description, hireDate, req.params.realtorId]
    );
    res.sendStatus(203);
  } catch (error) {
    res.json({ message: error.message });
  }
});

module.exports = router;