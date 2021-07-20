const Sequelize = require('sequelize')

const sequelize = require('../util/database')

const VotingItem = sequelize.define(
	'VotingItem',
	{
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			allowNull: true,
			primaryKey: true,
		},
		votingId: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		name: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		title: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		description: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		type: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		value: {
			type: Sequelize.TEXT,
			allowNull: true,
		},
	},
	{
		freezeTableName: true,
	}
)

module.exports = VotingItem
