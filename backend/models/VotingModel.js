const Sequelize = require('sequelize')

const sequelize = require('../util/database')

const Voting = sequelize.define(
	'Voting',
	{
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			allowNull: true,
			primaryKey: true,
		},
		name: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		title: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		type: {
			type: Sequelize.STRING,
			allowNull: false,
		},
		value: {
			type: Sequelize.TEXT,
			allowNull: false,
		},
		isMultiple: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
		},
	},
	{
		freezeTableName: true,
	}
)

module.exports = Voting
