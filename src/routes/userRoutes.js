const express = require('express');
const router = express.Router();
const { User } = require('../models');

router.post('/', async (req, res) => {
	try {
		const user = await User.create(req.body);
		res.json(user);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

router.get('/', async (req, res) => {
	try {
		const users = await User.findAll();
		res.json(users);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
