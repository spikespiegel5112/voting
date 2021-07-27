const VotingModel = require('../models/VotingModel');
const VotingOptionsModel = require('../models/VotingOptionsModel');
const uuidv1 = require('uuid/v1');
const uuidv4 = require('uuid/v4');
const uuidv5 = require('uuid/v5');
const sequelize = require('../util/database');

const getListByPagination = (req, res, next) => {
  console.log('getListByPagination++++++++++++', req);
  let pagination = {};
  let query = {};
  if (Object.keys(pagination).length > 0) {
    pagination = {
      limit: Number(req.query.limit),
      page: Number(req.query.page),
      offset: req.query.limit * (req.query.page - 1)
    };
  }
  if (req.query.type) {
    query = {
      where: {
        type: req.query.type
      }
    };
  }

  VotingModel.findAll(Object.assign(query, pagination))
    .then(async (data) => {
      res.status(200).json({
        pagination: {
          total: await VotingModel.count()
        },
        data
      });
    })
    .catch((error) => {
      res.status(500).json({
        error,
        req: pagination
      });
    });
};

const getVotingOptions = (req, res, next) => {
  const votingId = req.query.votingId;
  _getVotingOptionsPromise(votingId)
    .then((result) => {
      res.status(200).json({
        data: result
      });
    })
    .catch((error) => {
      res.status(500).json({
        error
      });
    });
};

const _getVotingOptionsPromise = (votingId) => {
  console.log('_getVotingOptionsPromise++++++', votingId);
  return new Promise((resolve, reject) => {
    VotingOptionsModel.findAll({
      where: {
        votingId
      },
      order: [['createdAt', 'ASC']]
    })
      .then(async (data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const _createOrUpdateOptionById = (req) => {
  return new Promise(async (resolve, reject) => {
    let optionList = req.body.optionList;

    // if (!optionList || optionList.length === 0) {
    //   resolve();
    // }
    const votingId = req.body.id;

    let currentVotingOptionList = await _getVotingOptionsPromise(votingId);

    currentVotingOptionList = currentVotingOptionList.map((item) => item.toJSON());

    const deletedOptions = currentVotingOptionList.filter((item) => {
      return !optionList.some((item2) => item.id === item2.id);
    });

    console.log('deletedOptions++++', deletedOptions);
    const deletedIdList = deletedOptions.map((item) => item.id);
    if (deletedIdList.length > 0) {
      await _deleteOptionsPromise(deletedIdList);
    }
    optionList = optionList.map((item) => {
      return {
        id: !item.id ? uuidv4() : item.id,
        votingId: item.votingId,
        title: item.title,
        description: item.description
      };
    });

    console.log('optionList+++++', optionList);

    VotingOptionsModel.bulkCreate(optionList, {
      updateOnDuplicate: ['title']
    })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const createOrUpdate = (req, res, next) => {
  const id = req.body.id;
  console.log('settingId', req.body);
  if (!id || id === '') {
    VotingModel.create({
      id: uuidv1(),
      name: req.body.name,
      title: req.body.title,
      type: req.body.type,
      isMultiple: req.body.isMultiple
    })
      .then(async (result) => {
        console.log('result+++++', result);
        await _createOrUpdateOptionById(req);

        res.status(200).json({
          message: 'Created successful',
          result
        });
      })
      .catch((error) => {
        res.status(500).json({
          message: 'Failed',
          error
        });
      });
  } else {
    console.log('id', id);

    VotingModel.findOne({
      where: {
        id
      }
    })
      .then(async (data) => {
        console.log(data);
        data.name = req.body.name;
        data.title = req.body.title;
        data.isMultiple = req.body.isMultiple;

        await data.save();
        await _createOrUpdateOptionById(req);
        res.status(200).json({
          message: 'Updated successful',
          result: data
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({
          message: 'Failed',
          req: req.body,
          error
        });
      });
  }
};
const _deleteOptionsPromise = (optionId) => {
  return new Promise((resolve, reject) => {
    if (optionId instanceof Array) {
      optionId.forEach((item, index) => {
        VotingOptionsModel.findOne({
          where: {
            id: item
          }
        })
          .then(async (response) => {
            const result = await response.destroy();
            resolve(result);
          })
          .catch((error) => {
            reject(error);
          });
      });
    } else {
      VotingModel.destroy({
        where: {
          id: optionId
        }
      })
        .then((result) => {
          console.log('result+++++', result);
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
    }
  });
};

const deleteItems = (req, res, next) => {
  console.log(req.body);
  console.log(req.params);
  const id = req.body.id;
  console.log(id instanceof Array);
  if (id instanceof Array) {
    id.forEach((item, index) => {
      VotingModel.findAll({
        where: {
          id: item
        }
      })
        .then(async (response) => {
          const result = await response.destroy();
          if (index + 1 === req.body.settingId.length) {
            res.status(200).json({
              message: 'Delete successful',
              body: result
            });
          }
        })
        .catch((error) => {
          res.status(500).json({
            message: 'Delete failed',
            error
          });
        });
    });
  } else {
    VotingModel.destroy({
      where: {
        id
      }
    })
      .then((result) => {
        console.log('result+++++', result);

        res.status(200).json({
          message: 'Delete successful',
          id
        });
      })
      .catch((error) => {
        res.status(500).json({
          message: 'Delete failed',
          error
        });
      });
  }
};

exports.createOrUpdate = createOrUpdate;
exports.getListByPagination = getListByPagination;
exports.deleteItems = deleteItems;
exports.getVotingOptions = getVotingOptions;
