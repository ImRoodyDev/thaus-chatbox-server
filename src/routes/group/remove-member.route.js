const router = require('express').Router();
const User = require('../../models/user');
const UserGroup = require('../../models/usergroup');

router.get('/', async (req, res) => {
	try {
		const groupId = req.query.groupId;
		const userId = req.query.username;

		// Check if the user is an admin of this group
		const userRole = await UserGroup.findOne({
			where: {
				userId: req.uuid,
				groupId: groupId,
			},
		});

		if (!userRole || userRole.role !== 'admin') {
			return res.status(403).send({ message: 'You are not authorized to remove members from this group' });
		}

		// Remove the user from the group
		const user = await User.findOne({
			where: {
				id: userId,
			},
		});

		if (!user) {
			return res.status(404).send({ message: 'User not found' });
		}

		await UserGroup.destroy({
			where: {
				userId: user.id,
				groupId: groupId,
			},
			force: true,
		});

		res.status(200).send({
			message: 'User removed from group successfully',
		});
	} catch (error) {
		console.error('Error in removing user from group:', error);
		res.status(500).send({ message: 'Internal server error' });
	}
});

module.exports = router;
