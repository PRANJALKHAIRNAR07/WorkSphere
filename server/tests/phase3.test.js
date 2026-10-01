const assert = require('assert');
const test = require('node:test');
const db = require('../src/config/db');

// Mock User Sessions for RBAC Testing
const adminUser = { id: 1, full_name: 'Alex Morgan', email: 'admin@worksphere.io', role: 'Admin' };
const managerUser = { id: 2, full_name: 'Sarah Jenkins', email: 'manager@worksphere.io', role: 'Manager' };
const memberUser = { id: 3, full_name: 'David Chen', email: 'david@worksphere.io', role: 'Member' };

test('Phase 3 - Projects CRUD & Role Access Control', async () => {
  const ProjectController = require('../src/controllers/projectController');

  // Test 1: Manager creates project (Allowed)
  let createdProjId = null;
  const reqCreate = {
    user: managerUser,
    body: {
      name: 'Phase 3 Verification Portal',
      key_code: `P3TEST_${Date.now().toString().slice(-4)}`,
      description: 'Test project for Phase 3 REST APIs',
      priority: 'High',
      budget: 12000.00
    }
  };

  const resCreate = {
    status(code) {
      assert.strictEqual(code, 201, 'Manager should be able to create projects');
      return {
        json(data) {
          assert.strictEqual(data.success, true);
          createdProjId = data.data.id;
        }
      };
    }
  };

  await ProjectController.createProject(reqCreate, resCreate, (err) => { if (err) throw err; });
  assert.ok(createdProjId, 'Project ID should be assigned on creation');

  // Test 2: Member role attempts to delete project (Denied 403)
  const roleMiddleware = require('../src/middleware/roleMiddleware');
  const adminOnlyMiddleware = roleMiddleware('Admin');
  
  let forbiddenStatus = null;
  const resForbidden = {
    status(code) {
      forbiddenStatus = code;
      return { json() {} };
    }
  };

  adminOnlyMiddleware({ user: memberUser }, resForbidden, () => {});
  assert.strictEqual(forbiddenStatus, 403, 'Member role must be denied project deletion with 403 Forbidden');
});

test('Phase 3 - Teams API & Member Directory', async () => {
  const TeamController = require('../src/controllers/teamController');

  const reqGet = { user: memberUser, query: {} };
  let teamsReturned = [];
  const resGet = {
    status(code) {
      assert.strictEqual(code, 200);
      return {
        json(data) {
          teamsReturned = data.data;
        }
      };
    }
  };

  await TeamController.getTeams(reqGet, resGet, (err) => { if (err) throw err; });
  assert.ok(Array.isArray(teamsReturned), 'Teams endpoint should return array of teams');
});

test('Phase 3 - Task Creation & Kanban Status Pipeline', async () => {
  const TaskController = require('../src/controllers/taskController');

  let createdTaskId = null;
  const reqTask = {
    user: memberUser,
    body: {
      title: 'Implement Socket Kanban State Broadcast',
      description: 'Broadcast position updates on task drag and drop',
      project_id: 1,
      assigned_to: memberUser.id,
      priority: 'Urgent',
      status: 'To Do'
    }
  };

  const resTask = {
    status(code) {
      assert.strictEqual(code, 201, 'Member should be able to create tasks');
      return {
        json(data) {
          assert.strictEqual(data.success, true);
          createdTaskId = data.data.id;
        }
      };
    }
  };

  await TaskController.createTask(reqTask, resTask, (err) => { if (err) throw err; });
  assert.ok(createdTaskId, 'Task ID should be assigned');

  // Move task to 'In Progress' then 'Completed'
  const reqReorder = {
    user: memberUser,
    params: { id: createdTaskId },
    body: { status: 'In Progress', position: 1 }
  };

  let reorderCode = null;
  const resReorder = {
    status(code) {
      reorderCode = code;
      return { json() {} };
    }
  };

  await TaskController.reorderTask(reqReorder, resReorder, (err) => { if (err) throw err; });
  assert.strictEqual(reorderCode, 200, 'Reorder task status update should return 200 OK');
});

test('Phase 3 - Task Comments Thread', async () => {
  const CommentController = require('../src/controllers/commentController');

  const reqComment = {
    user: memberUser,
    params: { taskId: 1 },
    body: { content: 'Automated test discussion comment for Phase 3' }
  };

  let commentCreated = false;
  const resComment = {
    status(code) {
      assert.strictEqual(code, 201);
      return {
        json(data) {
          commentCreated = data.success;
          assert.strictEqual(data.data.content, 'Automated test discussion comment for Phase 3');
        }
      };
    }
  };

  await CommentController.addComment(reqComment, resComment, (err) => { if (err) throw err; });
  assert.strictEqual(commentCreated, true, 'Comment should be successfully added');
});
