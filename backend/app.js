const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const csrf = require('csurf');
const session = require('express-session');
// const observe = require('object.observe');
const sequelize = require('./util/database');

const DictionaryModel = require('./models/DictionaryModel');
const LogModel = require('./models/LogModel');
const SettingModel = require('./models/SettingModel');
const UserModel = require('./models/UserModel');
const RoleModel = require('./models/RoleModel');
const VotingModel = require('./models/VotingModel');
const VotingOptionsModel = require('./models/VotingOptionsModel');

const errorController = require('./controllers/errorController');
const commonRoutes = require('./routers/commonRoutes');
const votingRoutes = require('./routers/votingRoutes');
const roleRoutes = require('./routers/roleRoutes');
const settingsRoutes = require('./routers/settingsRoutes');
const dictionaryRoutes = require('./routers/dictionary');
const userRoutes = require('./routers/userRoutes');

const csrfProtection = csrf({
  cookie: true
});
app.use(
  session({
    secret: 'my secret',
    reserve: false,
    saveUninitialized: false
  })
);

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.raw());
app.use(bodyParser.text());

app.use((err, req, res, next) => {
  let { origin } = req.headers;
  console.log('app start......');
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, HEAD, DELETE, OPTIONS');
  res.setHeader('X-Powered-By', '3.2.1');
  if (req.method.toUpperCase() === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
  } else {
    next();
  }
});
var corsOptions = {
  origin: '*', //只有百度可以访问
  optionsSuccessStatus: 200
};

app.use('/settings', cors(corsOptions), settingsRoutes);
app.use('/voting', cors(corsOptions), votingRoutes);
app.use('/dictionary', cors(corsOptions), dictionaryRoutes);
app.use('/common', cors(corsOptions), commonRoutes);
app.use('/user', cors(corsOptions), userRoutes);
app.use('/role', cors(corsOptions), roleRoutes);

// app.use('*', errorController.get404);

sequelize
  .sync()
  .then((result) => {
    app.listen(3000);
  })
  .catch((error) => {
    console.log(error);
  });
