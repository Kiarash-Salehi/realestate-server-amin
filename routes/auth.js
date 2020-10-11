const router = require('express').Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const isAuthorized = require('../middlewares/isAuthorized');
const isAdmin = require('../middlewares/isAdmin');

const validateEmail = async (email) => {
	const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
};

const checkDataBaseForEmail = async (email) => {
	const { rows: user } = await db.query('SELECT * FROM users WHERE email = $1;', [email]);
	if (user.length > 0) return true;
	else return false;
};

const checkDataBaseForUsername = async (username) => {
	const { rows: user } = await db.query('SELECT * FROM users WHERE username = $1;', [username]);
	if (user.length > 0) return true;
	else return false;
};

const registerFunc = async (email, username, password, res) => {
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);
	const { rows: user } = await db.query('INSERT INTO users (email, username, password) VALUES ($1, $2, $3) returning *;',
		[email, username, hashedPassword]);
	const token = jwt.sign({ id: user[0].id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
	res.status(203).json({
		message: 'کاربر با موفقیت ایجاد شد.',
		token,
		user: {
			id: user[0].id,
			username: user[0].username,
			email: user[0].email,
			isAdmin: user[0].is_admin
		}
	});
};

const validateUserAndRegister = async (email, username, password, password2, registerFunc, res) => {
	if (password === password2) {
		if (password.length >= 6 && password.length <= 100) {
			if (username.length > 3) {
				if (await checkDataBaseForUsername(username)) throw new Error('کاربر با نام کاربری وارد شده وجود دارد نام کاربری دیگری را امتحان کنید.');
				else {
					if (email === '' || email === null) throw new Error('لطفا یک ایمیل وارد کنید.');
					else if (validateEmail(email)) {
						if (await checkDataBaseForEmail(email)) throw new Error('کاربر با آدرس ایمیل وارد شده وجود دارد ایمیل دیگری را امتحان کنید.');
						else await registerFunc(email, username, password, res);
					}
					else throw new Error('ایمیل اشتباه است.');
				}
			}
			else throw new Error('نام کاربری شما باید بیشتر از 3 کاراکتر باشد.');
		}
		else if (password.length < 6) throw new Error('رمز عبور شما باید بیشتر از 6 کاراکتر باشد.');
		else throw new Error('رمز عبور باید کمتر از 100 کاراکتر باشد.');
	}
	else throw new Error('رمز عبور شما باید یکسان باشد.');
};

router.get('/users', isAuthorized, isAdmin, async (req, res) => {
	try {
		const { rows: users } = await db.query('SELECT * FROM users;');
		res.status(200).json(users);
	} catch (error) {
		res.status(300).json({ error: error.message });
	}
});

router.post('/register', async (req, res) => {
	try {
		const { email, username, password, password2 } = req.body;
		await validateUserAndRegister(email, username, password, password2, registerFunc, res);
	} catch (error) {
		if (error.constraint === 'users_email_key') {
			res.status(400).json({ message: 'ایمیل اشتباه است.' });
		} else if (error.constraint === 'users_username_key') {
			res.status(400).json({ message: 'نام کاربری وجود دارد لطفا یک نام کاربری دیگر را امتحان کنید.' });
		} else {
			res.status(400).json({ message: error.message });
		}
	}
});

router.delete('/delete/:id', async (req, res) => {
	try {
		const { id } = req.params;
		await db.query('DELETE FROM users WHERE id = $1', [id]);
		res.status(203).json({ message: 'کاربر با موفقیت حذف شد.' });
	} catch (error) {
		res.status(404).json({ error: error.message });
	}
});

router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		const { rows: user } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
		if (user.length === 0) throw new Error('ایمیل یا رمز عبور اشتباه است! لطفا دوباره تلاش کنید.');
		if (await bcrypt.compare(password, user[0].password)) {
			const token = jwt.sign({ id: user[0].id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
			res.header('Authorization', `Bearer ${token}`).status(200).json({
				message: `شما با موفقیت وارد حساب کاربری خود شدید. خوش آمدید ${user[0].username}`,
				token,
				user: {
					id: user[0].id,
					username: user[0].username,
					email: user[0].email,
					isAdmin: user[0].is_admin
				}
			});
		}
		else throw new Error('ایمیل یا رمز عبور اشتباه است! لطفا دوباره تلاش کنید.');
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

router.get('/user', isAuthorized, async (req, res) => {
	try {
		const { rows: user } = await db.query('SELECT * FROM users WHERE id = $1;', [req.userId]);
		res.status(200).json({
			user: {
				id: user[0].id,
				username: user[0].username,
				email: user[0].email,
				isAdmin: user[0].is_admin
			}
		});
	} catch (error) {
		res.json({ error: error.message });
	}
});

module.exports = router;