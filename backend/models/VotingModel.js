const Sequelize = require('sequelize');

const sequelize = require('../util/database');

const Voting = sequelize.define(
  'Voting',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: true
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    type: {
      type: Sequelize.STRING,
      allowNull: true
    },
    value: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    isMultiple: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    }
  },
  {
    freezeTableName: true
  }
);

module.exports = Voting;
