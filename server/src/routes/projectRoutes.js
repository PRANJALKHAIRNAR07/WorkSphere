const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/projectController');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.use(authenticateToken);

router.get('/', ProjectController.getProjects);
router.get('/:id', ProjectController.getProjectById);
router.post('/', authorizeRoles('Admin', 'Manager'), ProjectController.createProject);
router.put('/:id', authorizeRoles('Admin', 'Manager'), ProjectController.updateProject);
router.delete('/:id', authorizeRoles('Admin'), ProjectController.deleteProject);
router.post('/:id/members', authorizeRoles('Admin', 'Manager'), ProjectController.addMember);

module.exports = router;
