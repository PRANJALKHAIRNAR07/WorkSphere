const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', TaskController.getTasks);
router.get('/:id', TaskController.getTaskById);
router.post('/', TaskController.createTask);
router.put('/:id', TaskController.updateTask);
router.patch('/:id/reorder', TaskController.reorderTask);
router.delete('/:id', TaskController.deleteTask);

module.exports = router;
