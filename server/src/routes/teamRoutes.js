const express = require('express');
const router = express.Router();
const TeamController = require('../controllers/teamController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.get('/', TeamController.getTeams);
router.get('/:id', TeamController.getTeamById);
router.post('/', authorizeRoles('Admin', 'Manager'), TeamController.createTeam);
router.post('/:id/members', authorizeRoles('Admin', 'Manager'), TeamController.addMember);

module.exports = router;
