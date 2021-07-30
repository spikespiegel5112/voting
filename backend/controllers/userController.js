const express = require('express');
const uuidv1 = require('uuid/v1');
const crypto = require('crypto');
const UserModel = require('../models/UserModel');
const { encryptPromise, decrypt } = require('./CommonController');


const createOrUpdate = (req, res, next) => {
  const id = req.body.id;
  let role = req.body.role;

  if (!id || id === '') {
    UserModel.create({
      id: uuidv1(),
      loginName: req.body.loginName,
      role: role,
      password: req.body.password,
      description: req.body.description,
      phone: req.body.phone,
      address: req.body.address,
      email: req.body.email
    })
      .then(async (result) => {
        console.log('result+++++', result);
        res.status(200).json({
          message: 'Created successful',
          result
        });
      })
      .catch((error) => {
        console.log(error);

        res.status(500).json({
          message: 'Failed',
          error
        });
      });
  } else {
    console.log('id', id);
    UserModel.findOne({
      where: {
        id
      }
    })
      .then(async (data) => {
        console.log(data);
        data.loginName = req.body.loginName;
        data.password = req.body.password;
        data.role = role;
        data.description = req.body.description;
        data.phone = req.body.phone;
        data.address = req.body.address;
        data.email = req.body.email;
        data.role = req.body.role;
        await data.save();
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

const deleteItems = (req, res, next) => {
  const id = req.body.id;
  console.log(id instanceof Array);
  if (id instanceof Array) {
    id.forEach((item, index) => {
      UserModel.findAll({
        where: {
          id: item
        }
      })
        .then(async (response) => {
          response.forEach(async (item2) => {
            const result = await item2.destroy();
            res.status(200).json({
              message: 'Delete successful',
              body: result
            });
          });
        })
        .catch((error) => {
          res.status(500).json({
            message: 'Delete failed',
            error
          });
        });
    });
  } else {
    UserModel.destroy({
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

const getListByPagination = (req, res, next) => {
  let pagination = {};
  let query = {};

  pagination = {
    limit: Number(req.query.limit),
    page: Number(req.query.page),
    offset: req.query.limit * (req.query.page - 1)
  };
  if (req.query.type) {
    query = {
      where: {
        type: req.query.type
      }
    };
  }
  UserModel.findAll(Object.assign(query, pagination))
    .then(async (response) => {
      console.log('getListByPagination+++++', response);
      response = response.map((item) => {
        const password = decrypt(item.password || '');
        return {
          ...item,
          password
        };
      });
      res.status(200).json({
        pagination: {
          total: await UserModel.count()
        },
        data: response
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error,
        req: pagination
      });
    });
};

const register = async (req, res, next) => {
  UserModel.findOne({
    where: {
      loginName: req.body.loginName
    }
  })
    .then((response) => {
      //   response = response.toJSON();
      if (!!response && response.toJSON().loginName === req.body.loginName) {
        res.status(400).json({
          message: '此用户名已存在'
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });

  const password = await encryptPromise(req.body.password);

  UserModel.create({
    id: uuidv1(),
    loginName: req.body.loginName,
    password
  })
    .then((response) => {
      res.status(200).json({
        data: response
      });
    })
    .catch((error) => {
      res.status(500).json({
        error
      });
    });
};

const login = (req, res, next) => {
  UserModel.findOne({
    where: {
      loginName: req.body.loginName
    }
  })
    .then(async (response) => {
      const responsePassword = response.password;
      const requestPassword = await encryptPromise(req.body.password);

      if (responsePassword === requestPassword) {
        req.session.loginName = req.body.loginName;
        res.status(200).json({
          data: req.body
        });
      } else {
        res.status(400).json({
          message: '密码不对'
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({
        message: '无此用户',
        error
      });
    });
};

const logout = (req, res, next) => {
  UserModel.findOne({
    where: {
      loginName: req.body.loginName
    }
  })
    .then((response) => {
      res.status(200).json({
        message: '注销成功',
        data: response
      });
    })
    .catch((error) => {
      res.status(500).json({
        error
      });
    });
};

const userInfo = (req, res, next) => {
  UserModel.findOne({
    where: {
      userId: req.query.userId
    }
  })
    .then((response) => {
      res.status(200).json({
        data: response
      });
    })
    .catch((error) => {
      res.status(500).json({
        error
      });
    });
};

exports.createOrUpdate = createOrUpdate;
exports.getListByPagination = getListByPagination;
exports.deleteItems = deleteItems;
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.userInfo = userInfo;
