const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const csrf = require('csurf')
const session = require('express-session')
// const observe = require('object.observe');
const sequelize = require('./util/database')

const Dictionaries = require('./models/Dictionaries')
const LogsModel = require('./models/LogsModel')
const SettingsModel = require('./models/SettingsModel')

const errorController = require('./controllers/errorController')
const commonRoutes = require('./routers/commonRoutes')
const settingsRoutes = require('./routers/settingsRoutes')
const dictionaryRoutes = require('./routers/dictionary')
const userRoutes = require('./routers/userRoutes')
const testRoutes = require('./routers/testRoutes')

const csrfProtection = csrf({
	cookie: true,
})
app.use(
	session({
		secret: 'my secret',
		reserve: false,
		saveUninitialized: false,
	})
)

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.raw())
app.use(bodyParser.text())

app.use((err, req, res, next) => {
	let { origin } = req.headers
	console.log('dsdsds')
	res.header('Access-Control-Allow-Origin', '*')
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept'
	)
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PUT, HEAD, DELETE, OPTIONS'
	)
	res.setHeader('X-Powered-By', '3.2.1')
	if (req.method.toUpperCase() === 'OPTIONS') {
		res.statusCode = 204
		res.end()
	} else {
		next()
	}
})
var corsOptions = {
	origin: '*', //只有百度可以访问
	optionsSuccessStatus: 200,
}

app.use('/settings', cors(corsOptions), settingsRoutes)
app.use('/dictionary', cors(corsOptions), dictionaryRoutes)
app.use('/common', cors(corsOptions), commonRoutes)
app.use('/user', cors(corsOptions), userRoutes)
app.use('/test', cors(corsOptions), testRoutes)

// app.use('*', errorController.get404);

sequelize
	.sync()
	.then((result) => {
		app.listen(3000)
	})
	.catch((error) => {
		console.log(error)
	})
