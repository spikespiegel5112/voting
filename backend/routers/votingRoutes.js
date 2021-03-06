const express = require('express');
const router = express.Router();

const VotingController = require('../controllers/VotingController');

router.get('/getListByPagination', VotingController.getListByPagination);
router.get('/getVotingOptions', VotingController.getVotingOptions);
router.post('/createOrUpdate', VotingController.createOrUpdate);
router.delete('/deleteItems', VotingController.deleteItems);

module.exports = router;
