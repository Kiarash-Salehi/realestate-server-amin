const db = require('../db');

module.exports = async (req, res, next) => {
  try {
    const { rows: user } = await db.query('SELECT is_admin FROM users WHERE id = $1;', [req.userId]);
    if (!user[0].is_admin) throw new Error('You are not allowed to see or alter any data');
    else next();
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
};