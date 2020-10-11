const router = require('express').Router();
const db = require('../db');
const isAuthorized = require('../middlewares/isAuthorized');
const isAdmin = require('../middlewares/isAdmin');

router.get('/', isAuthorized, isAdmin, async (req, res) => {
  try {
    const { rows: inquiries } = db.query('SELECT * FROM inquiries;');
    res.status(200).json({ inquiries });
  } catch (error) {
    res.status(500).json({ message: 'Unable to get all realtors' });
  }
});

router.post('/add', isAuthorized, async (req, res) => {
  try {
    const { email, number, message } = req.params;
    await db.query('INSERT INTO inquiries (email, number, message, user_id) VALUES ($1, $2, $3, $4);',
      [email, number, message, req.userId]);
    res.status(203);
  } catch (error) {
    res.status(500).json({ message: 'Unable send inquiry' });
  }
});

router.post('/done/:inquiryId', isAuthorized, isAdmin, async (req, res) => {
  try {
    await db.query('UPDATE inquiries SET done = true WHERE id = $1;',
      [req.params.inquiryId]);
    res.status(203);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update inquiry' });
  }
});

router.delete('/delete/:inquiryId', isAuthorized, isAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM inquiries WHERE id = $1;',
      [req.params.inquiryId]);
    res.status(203);
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete inquiry' });
  }
});

module.exports = router;