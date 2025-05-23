const router = require('express').Router();
const Group = require('../../models/group');
const User = require('../../models/user');
const Feature = require('../../models/feature');
const Epic = require('../../models/epic');
const Story = require('../../models/story');
const Sprint = require('../../models/sprint');
const UserGroup = require('../../models/usergroup');

router.get('/', async (req, res) => {
	try {
		// Fetch groups with related data
		const usergroups = await UserGroup.findAll({
			where: { userId: req.uuid },
			attributes: ['role', 'createdAt'], // Fetch only the role of the user in the group
			include: [
				{
					model: Group,
					include: [
						{
							model: Feature,
							include: [
								{
									model: Epic,
									include: [
										{
											model: Story,
											attributes: ['id', 'name', 'description', 'startDate', 'endDate', 'sprintId', 'userId'],
										},
									],
								},
							],
						},
						{
							model: UserGroup,
							attributes: ['role', 'userId'],
							include: [
								{
									model: User,
									attributes: ['id', 'username'],
								},
							],
						},
						{
							model: Sprint,
							attributes: ['id', 'startDate', 'endDate', 'createdAt'],
						},
					],
				},
			],
		});

		// Check if groups exist
		if (!usergroups || usergroups.length === 0) {
			return res.status(404).send({ message: 'No groups found' });
		}

		// Format response data
		const groups = usergroups.map((usergroup) => {
			const group = usergroup.Group;

			return {
				id: group.id,
				name: group.name,
				type: group.type,
				ownerId: group.ownerId,
				createdAt: group.createdAt,
				updatedAt: group.updatedAt,
				currentUserRole: usergroup.role,

				// Map members
				members:
					group.UserGroups.map((member) => ({
						userId: member.userId,
						username: member.User?.username,
						role: member.role,
						createdAt: member.createdAt,
					})) || [],

				// Map sprints
				sprints:
					group.Sprints?.map((sprint) => ({
						id: sprint.id,
						name: sprint.name,
						startDate: sprint.startDate,
						endDate: sprint.endDate,
						createdAt: sprint.createdAt,
					})) || [],

				// Map features and nested items
				features:
					group.Features?.map((feature) => ({
						id: feature.id,
						name: feature.name,
						description: feature.description,
						createdAt: feature.createdAt,

						epics:
							feature.Epics?.map((epic) => ({
								id: epic.id,
								name: epic.name,
								description: epic.description,
								createdAt: epic.createdAt,

								stories:
									epic.Stories?.map((story) => ({
										id: story.id,
										name: story.name,
										description: story.description,
										sprintId: story.sprintId,
										userId: story.userId,
										startDate: story.startDate,
										endDate: story.endDate,
										createdAt: story.createdAt,
									})) || [],
							})) || [],
					})) || [],
			};
		});

		// Send response to client
		res.status(200).send({
			message: 'Groups fetched successfully',
			groups: groups || [],
		});
	} catch (error) {
		console.error('Error in fetching groups:', error);
		res.status(500).send({ message: 'Internal server error' });
	}
});

module.exports = router;
