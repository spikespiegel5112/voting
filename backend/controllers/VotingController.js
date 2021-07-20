const VotingModel = require('../models/VotingModel')
const uuidv1 = require('uuid/v1')

const getListByPagination = (req, res, next) => {
	console.log('getListByPagination++++++++++++', req)
	let pagination = {}
	let query = {}
	if (Object.keys(pagination).length > 0) {
		pagination = {
			limit: Number(req.query.limit),
			page: Number(req.query.page),
			offset: req.query.limit * (req.query.page - 1),
		}
	}
	if (req.query.type) {
		query = {
			where: {
				type: req.query.type,
			},
		}
	}

	VotingModel.findAll(Object.assign(query, pagination))
		.then(async (data) => {
			res.status(200).json({
				pagination: {
					total: await VotingModel.count(),
				},
				data: data,
			})
		})
		.catch((error) => {
			res.status(500).json({
				error: error,
				req: pagination,
			})
		})
}

const createOrUpdate = (req, res, next) => {
	let settingId = req.body.settingId
	console.log('settingId', req.body)
	if (!settingId || settingId === '') {
		VotingModel.create({
			settingId: uuidv1(),
			name: req.body.name,
			type: req.body.type,
			code: req.body.code,
			value: req.body.value,
		})
			.then((result) => {
				res.status(200).json({
					message: 'Created successful',
					result: result,
				})
			})
			.catch((error) => {
				res.status(400).json({
					message: 'Failed',
					error: error.toString(),
				})
			})
	} else {
		console.log('settingId', settingId)

		VotingModel.findOne({
			where: {
				settingId: settingId,
			},
		})
			.then(async (data) => {
				console.log(data)
				data.name = req.body.name
				data.type = req.body.type
				data.code = req.body.code
				data.value = req.body.value
				await data.save()
				res.status(200).json({
					message: 'Updated successful',
					result: data,
				})
			})
			.catch((error) => {
				console.log(error)
				res.status(400).json({
					message: 'Failed',
					req: req.body,
					error: error.toString(),
				})
			})
	}
}

const deleteItems = (req, res, next) => {
	console.log(req.body)
	console.log(req.params)
	const settingId = req.body.settingId
	console.log(settingId instanceof Array)
	if (settingId instanceof Array) {
		settingId.forEach((item, index) => {
			VotingModel.findAll({
				where: {
					settingId: item,
				},
			})
				.then(async (response) => {
					const result = await response.destroy()
					if (index + 1 === req.body.settingId.length) {
						res.status(200).json({
							message: 'Delete successful',
							body: result,
						})
					}
				})
				.catch((error) => {
					res.status(400).json({
						message: 'Delete failed',
						error: error.toString(),
					})
				})
		})
	} else {
		// VotingModel.findAll({
		// 	where: {
		// 		settingId: settingId
		// 	}
		// }).then(result => {
		//
		// }).catch(error => {
		//
		// });

		VotingModel.destroy({
			where: {
				settingId: settingId,
			},
		})
			.then((result) => {
				console.log('result+++++', result)

				res.status(200).json({
					message: 'Delete successful',
					settingId: settingId,
				})
			})
			.catch((error) => {
				res.status(400).json({
					message: 'Delete failed',
					error: error.toString(),
				})
			})
	}
}

exports.createOrUpdate = createOrUpdate
exports.getListByPagination = getListByPagination
exports.deleteItems = deleteItems
