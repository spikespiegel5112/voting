const express = require('express');
const uuidv1 = require('uuid/v1');
const UserModel = require('../models/UserModel');

const createOrUpdate = (req, res, next) => {
  const id = req.body.id;
  if (!id || id === '') {
    UserModel.create({
      id: uuidv1(),
      loginName: req.body.loginName,
      role: req.body.role,
      password: req.body.password,
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
        data.role = req.body.role;
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

const register = (req, res, next) => {
  UserModel.create({
    loginName: req.body.loginName,
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email,
    address: req.body.address
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
      loginName: req.query.loginName
    }
  })
    .then((response) => {
      if (response.password === req.query.password) {
        res.status(200).json({
          data: req.query
        });
      } else {
        res.status(500).json({
          message: '密码不对'
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: '无此用户'
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
exports.register = register;
exports.login = login;
exports.logout = logout;
exports.userInfo = userInfo;
