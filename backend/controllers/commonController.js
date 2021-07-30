const express = require('express');
const uuidv1 = require('uuid/v1');
const fs = require('fs');
const path = require('path');
const fastCsv = require('fast-csv');
const fetch = require('node-fetch');
const atob = require('atob');
const btoa = require('btoa');
const { scrypt, randomFill, createCipheriv } = require('crypto');

const encryptPromise = (password) => {
  const algorithm = 'aes-192-cbc';
  return new Promise((resolve, reject) => {
    scrypt(password, 'salt', 24, (err, key) => {
      if (err) reject(err);
      const iv = Buffer.from('1234567812345678', 'utf8');
      const cipher = createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update('some clear text data', 'utf8', 'hex');
      encrypted += cipher.final('hex');
      resolve(encrypted);
    });
  });
};

const decrypt = (text) => {
  const algorithm = 'aes-192-cbc';
  let src = '';
  const iv = Buffer.from('1234567812345678', 'utf8');
  const cipher = crypto.createDecipheriv(algorithm, key, iv);
  src += cipher.update(text, 'hex', 'utf8');
  src += cipher.final('utf8');
  return src;
};

const _getBase64DataFromPagePromise = (req) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await crawlPagePromise(req);
      console.log('_crawlRankingListBoxOfficePromise+++++', req.query);
      console.log('response+++++', response);
      const $ = response.$;
      const base64 = $('#js-nuwa')
        .html()
        .match(/(?<=src:url\().+.(?=\)\sformat\("woff"\))/)[0];

      resolve(base64);
    } catch (error) {
      reject(error);
    }
  });
};

const getBase64Data = async (req, res, next) => {
  _getBase64DataFromPagePromise(req)
    .then((response) => {
      res.status(200).json({
        data: response
      });
    })
    .catch((error) => {
      res.status(400).json({
        error2: error
      });
    });
};

const arrayBufferToBase64 = (req, res, next) => {
  const buffer = req.body.buffer;
  let binary = '';
  let bytes = new Uint8Array(buffer);

  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  res.status(200).json({
    data: btoa(binary)
  });
  return btoa(binary);
};

const exportCSV = (req, res) => {
  const rows = req.body.data;
  console.log('rows', rows);

  const options = {
    root: __dirname + '/public/',
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  };
  fastCsv
    .writeToBuffer(rows)
    .then((data) => {
      console.log('buffer+++++', data);
      // res.status(200).send(data)
      fs.writeFile('aaa' + '.csv', data);
      // res.status(200).sendFIle('aaa', options)
    })
    .catch((error) => {
      res.status(400).json({
        error: error
      });
    });
};

exports.encryptPromise = encryptPromise;
exports.decrypt = decrypt;
exports.getBase64Data = getBase64Data;
exports.arrayBufferToBase64 = arrayBufferToBase64;
exports.exportCSV = exportCSV;
