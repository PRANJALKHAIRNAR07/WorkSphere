const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

let pool = null;
let isConnected = false;

// In-Memory Data Store Fallback for environments without an active MySQL instance running
const memoryStore = {
  users: [
    { id: 1, full_name: 'Alex Morgan', email: 'admin@worksphere.io', password_hash: '$2a$10$Kn6VccgF5uxrVGCwvPw09ufBJsnTPM3Fx4oKjnfO76QCExm7SnN/W', role: 'Admin', avatar_url: null, bio: 'Platform Admin', job_title: 'Chief Technology Officer', department: 'Engineering', status: 'Active', created_at: new Date() },
    { id: 2, full_name: 'Sarah Jenkins', email: 'manager@worksphere.io', password_hash: '$2a$10$Kn6VccgF5uxrVGCwvPw09ufBJsnTPM3Fx4oKjnfO76QCExm7SnN/W', role: 'Manager', avatar_url: null, bio: 'Product Manager', job_title: 'Senior Product Manager', department: 'Product', status: 'Active', created_at: new Date() },
    { id: 3, full_name: 'David Chen', email: 'david@worksphere.io', password_hash: '$2a$10$Kn6VccgF5uxrVGCwvPw09ufBJsnTPM3Fx4oKjnfO76QCExm7SnN/W', role: 'Member', avatar_url: null, bio: 'Frontend Lead', job_title: 'Full Stack Developer', department: 'Engineering', status: 'Active', created_at: new Date() },
    { id: 4, full_name: 'Elena Rostova', email: 'elena@worksphere.io', password_hash: '$2a$10$Kn6VccgF5uxrVGCwvPw09ufBJsnTPM3Fx4oKjnfO76QCExm7SnN/W', role: 'Member', avatar_url: null, bio: 'UI Designer', job_title: 'UI/UX Designer', department: 'Design', status: 'Active', created_at: new Date() },
    { id: 5, full_name: 'Marcus Vance', email: 'marcus@worksphere.io', password_hash: '$2a$10$Kn6VccgF5uxrVGCwvPw09ufBJsnTPM3Fx4oKjnfO76QCExm7SnN/W', role: 'Member', avatar_url: null, bio: 'QA Specialist', job_title: 'QA Automation Engineer', department: 'QA', status: 'Active', created_at: new Date() }
  ],
  password_resets: [],
  teams: [
    { id: 1, name: 'Core Engineering', description: 'Platform infrastructure and API development.', created_by: 1, created_at: new Date() },
    { id: 2, name: 'Product & Design', description: 'Product vision, wireframing, and component design.', created_by: 2, created_at: new Date() }
  ],
  team_members: [
    { id: 1, team_id: 1, user_id: 1, role: 'Owner' },
    { id: 2, team_id: 1, user_id: 3, role: 'Member' },
    { id: 3, team_id: 1, user_id: 5, role: 'Member' },
    { id: 4, team_id: 2, user_id: 2, role: 'Owner' },
    { id: 5, team_id: 2, user_id: 4, role: 'Member' }
  ],
  projects: [
    { id: 1, name: 'WorkSphere 2.0 Web Portal', key_code: 'WS2', description: 'Revamping main platform UI with React, real-time metrics, Kanban board and notifications.', status: 'In Progress', priority: 'High', start_date: '2026-09-01', end_date: '2026-11-30', created_by: 1, team_id: 1, budget: 45000.00, created_at: new Date() },
    { id: 2, name: 'Mobile Client API Integration', key_code: 'MOB', description: 'REST API and WebSocket gateway for upcoming iOS and Android applications.', status: 'Planning', priority: 'Medium', start_date: '2026-10-15', end_date: '2026-12-20', created_by: 2, team_id: 1, budget: 28000.00, created_at: new Date() },
    { id: 3, name: 'Design System Refresh', key_code: 'DSR', description: 'Unified component library, color palette, dark mode system, and typography tokens.', status: 'In Progress', priority: 'Urgent', start_date: '2026-09-10', end_date: '2026-10-31', created_by: 2, team_id: 2, budget: 15000.00, created_at: new Date() }
  ],
  project_members: [
    { id: 1, project_id: 1, user_id: 1, project_role: 'Lead' },
    { id: 2, project_id: 1, user_id: 3, project_role: 'Contributor' },
    { id: 3, project_id: 1, user_id: 4, project_role: 'Contributor' },
    { id: 4, project_id: 1, user_id: 5, project_role: 'Contributor' },
    { id: 5, project_id: 2, user_id: 1, project_role: 'Lead' },
    { id: 6, project_id: 2, user_id: 3, project_role: 'Contributor' },
    { id: 7, project_id: 3, user_id: 2, project_role: 'Lead' },
    { id: 8, project_id: 3, user_id: 4, project_role: 'Contributor' }
  ],
  tasks: [
    { id: 1, task_key: 'WS2-1', title: 'Setup Auth JWT Middleware & Express Routes', description: 'Implement registration, login, token refresh, and role-based permissions checking.', project_id: 1, assigned_to: 3, created_by: 1, status: 'Completed', priority: 'High', due_date: '2026-09-15', estimated_hours: 12.00, actual_hours: 10.50, position: 1, created_at: new Date() },
    { id: 2, task_key: 'WS2-2', title: 'Build Interactive Kanban Board', description: 'Implement drag and drop task movement across status columns with Socket.IO syncing.', project_id: 1, assigned_to: 3, created_by: 1, status: 'In Progress', priority: 'Urgent', due_date: '2026-10-05', estimated_hours: 24.00, actual_hours: 14.00, position: 1, created_at: new Date() },
    { id: 3, task_key: 'WS2-3', title: 'Design Modern Dark & Light Mode Theme', description: 'Create Tailwind design system tokens, typography scales, glassmorphism cards and layout sidebar.', project_id: 1, assigned_to: 4, created_by: 2, status: 'In Progress', priority: 'High', due_date: '2026-10-08', estimated_hours: 18.00, actual_hours: 8.00, position: 2, created_at: new Date() },
    { id: 4, task_key: 'WS2-4', title: 'End-to-End API Security Audit', description: 'Check parameterized SQL queries, JWT expiration handling, XSS protection, and rate limiting.', project_id: 1, assigned_to: 5, created_by: 1, status: 'To Do', priority: 'Medium', due_date: '2026-10-20', estimated_hours: 16.00, actual_hours: 0.00, position: 1, created_at: new Date() },
    { id: 5, task_key: 'WS2-5', title: 'Analytics & Productivity Charts Integration', description: 'Integrate Chart.js for project metrics, task velocity, team workload distribution, and CSV export.', project_id: 1, assigned_to: 3, created_by: 2, status: 'To Do', priority: 'Medium', due_date: '2026-10-25', estimated_hours: 20.00, actual_hours: 0.00, position: 2, created_at: new Date() }
  ],
  comments: [
    { id: 1, task_id: 2, user_id: 1, content: 'Please ensure drag-and-drop triggers real-time updates via Socket.IO for all connected workspace members.', created_at: new Date() },
    { id: 2, task_id: 2, user_id: 3, content: 'Working on the drag-and-drop state sync now. Integrating HTML5 Drag & Drop with state optimistic UI update.', created_at: new Date() }
  ],
  attachments: [],
  notifications: [
    { id: 1, user_id: 3, title: 'New Task Assigned', message: 'You have been assigned to task "Build Interactive Kanban Board" in WorkSphere 2.0 Web Portal', type: 'task_assigned', is_read: 0, link: '/projects/1/tasks/2', created_at: new Date() },
    { id: 2, user_id: 4, title: 'Project Invitation', message: 'You were added to project "Design System Refresh" as Contributor', type: 'project_invite', is_read: 1, link: '/projects/3', created_at: new Date() }
  ],
  activity_logs: []
};

async function initPool() {
  if (pool) return pool;

  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'worksphere_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const conn = await pool.getConnection();
    conn.release();
    isConnected = true;
    console.log('⚡ MySQL Database Connection Pool Established Successfully');
  } catch (err) {
    console.warn(`⚠️ MySQL Connection Warning: ${err.message}. Using high-performance MemoryStore Provider for active sandbox execution.`);
    isConnected = false;
  }
  return pool;
}

// Execute parameterized SQL query safely
async function query(sql, params = []) {
  await initPool();
  if (isConnected && pool) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (error) {
      console.error('Database Query Error:', error.message);
      throw error;
    }
  }

  // Pure Parameterized Fallback Engine for environments without live MySQL
  return executeInMemoryQuery(sql, params);
}

// Fallback logic for mock environment to ensure full REST functionality
function executeInMemoryQuery(sql, params) {
  const cleanSql = sql.trim().toLowerCase().replace(/\s+/g, ' ');

  // 1. TEAMS & TEAM MEMBERS QUERIES
  if (cleanSql.includes('from teams')) {
    const mapTeam = (t) => {
      const creator = memoryStore.users.find(u => u.id === t.created_by);
      const memberCount = memoryStore.team_members.filter(tm => tm.team_id === t.id).length;
      const projectCount = memoryStore.projects.filter(p => p.team_id === t.id).length;
      return {
        ...t,
        creator_name: creator ? creator.full_name : 'Admin',
        member_count: memberCount || 1,
        project_count: projectCount || 0
      };
    };

    if (cleanSql.includes('where t.id =') || cleanSql.includes('where id =')) {
      const teamId = parseInt(params[0]);
      return memoryStore.teams.filter(t => t.id === teamId).map(mapTeam);
    }
    return memoryStore.teams.map(mapTeam);
  }

  if (cleanSql.includes('from team_members')) {
    const teamId = params[0] ? parseInt(params[0]) : null;
    return memoryStore.team_members
      .filter(tm => !teamId || tm.team_id === teamId)
      .map(tm => {
        const u = memoryStore.users.find(usr => usr.id === tm.user_id) || {};
        return {
          ...tm,
          full_name: u.full_name || 'Team Member',
          email: u.email || '',
          avatar_url: u.avatar_url || null,
          job_title: u.job_title || '',
          department: u.department || ''
        };
      });
  }

  if (cleanSql.includes('insert into teams')) {
    const newTeam = {
      id: memoryStore.teams.length + 1,
      name: params[0],
      description: params[1] || '',
      created_by: params[2],
      created_at: new Date()
    };
    memoryStore.teams.push(newTeam);
    return { insertId: newTeam.id, affectedRows: 1 };
  }

  if (cleanSql.includes('insert into team_members')) {
    const newTm = {
      id: memoryStore.team_members.length + 1,
      team_id: parseInt(params[0]),
      user_id: parseInt(params[1]),
      role: params[2] || 'Member'
    };
    memoryStore.team_members.push(newTm);
    return { insertId: newTm.id, affectedRows: 1 };
  }

  // 2. USERS QUERIES
  if (cleanSql.includes('from users')) {
    if (cleanSql.includes('where email =')) {
      const user = memoryStore.users.find(u => u.email.toLowerCase() === (params[0] || '').toLowerCase());
      return user ? [{ ...user }] : [];
    }
    if (cleanSql.includes('where id =') || cleanSql.includes('where u.id =')) {
      const user = memoryStore.users.find(u => u.id === parseInt(params[0]));
      return user ? [{ ...user }] : [];
    }
    return memoryStore.users.map(u => ({ ...u }));
  }

  if (cleanSql.includes('insert into users')) {
    const newUser = {
      id: memoryStore.users.length + 1,
      full_name: params[0],
      email: params[1],
      password_hash: params[2],
      role: params[3] || 'Member',
      job_title: params[4] || null,
      department: params[5] || null,
      avatar_url: null,
      bio: null,
      status: 'Active',
      created_at: new Date()
    };
    memoryStore.users.push(newUser);
    return { insertId: newUser.id, affectedRows: 1 };
  }

  if (cleanSql.includes('update users set')) {
    const userId = parseInt(params[params.length - 1]);
    const userIndex = memoryStore.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      if (cleanSql.includes('full_name =')) {
        memoryStore.users[userIndex].full_name = params[0] || memoryStore.users[userIndex].full_name;
        memoryStore.users[userIndex].job_title = params[1] || '';
        memoryStore.users[userIndex].department = params[2] || '';
        memoryStore.users[userIndex].bio = params[3] || '';
      } else if (cleanSql.includes('password_hash =')) {
        memoryStore.users[userIndex].password_hash = params[0];
      }
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  // 3. PROJECT MEMBERS QUERIES
  if (cleanSql.includes('from project_members')) {
    const projId = params[0] ? parseInt(params[0]) : null;
    return memoryStore.project_members
      .filter(pm => !projId || pm.project_id === projId)
      .map(pm => {
        const u = memoryStore.users.find(usr => usr.id === pm.user_id) || {};
        return {
          ...pm,
          full_name: u.full_name || 'Member',
          email: u.email || '',
          avatar_url: u.avatar_url || null,
          job_title: u.job_title || '',
          global_role: u.role || 'Member'
        };
      });
  }

  // 4. PROJECTS QUERIES
  if (cleanSql.includes('from projects')) {
    let projs = memoryStore.projects.map(p => {
      const creator = memoryStore.users.find(u => u.id === p.created_by);
      const team = memoryStore.teams.find(t => t.id === p.team_id);
      const projectTasks = memoryStore.tasks.filter(t => t.project_id === p.id);
      const completedTasks = projectTasks.filter(t => t.status === 'Completed');
      return {
        ...p,
        creator_name: creator ? creator.full_name : 'Admin',
        team_name: team ? team.name : 'Core Team',
        task_count: projectTasks.length,
        completed_task_count: completedTasks.length
      };
    });

    if (cleanSql.includes('where key_code =')) {
      return projs.filter(p => p.key_code.toLowerCase() === (params[0] || '').toLowerCase());
    }
    if (cleanSql.includes('where p.id =') || cleanSql.includes('where id =')) {
      return projs.filter(p => p.id === parseInt(params[0]));
    }
    return projs;
  }

  if (cleanSql.includes('insert into projects')) {
    const newProj = {
      id: memoryStore.projects.length + 1,
      name: params[0],
      key_code: params[1],
      description: params[2],
      status: params[3] || 'Planning',
      priority: params[4] || 'Medium',
      start_date: params[5],
      end_date: params[6],
      created_by: params[7],
      team_id: params[8] || null,
      budget: parseFloat(params[9] || 0.00),
      created_at: new Date()
    };
    memoryStore.projects.push(newProj);
    return { insertId: newProj.id, affectedRows: 1 };
  }

  if (cleanSql.includes('update projects')) {
    const projId = parseInt(params[params.length - 1]);
    const idx = memoryStore.projects.findIndex(p => p.id === projId);
    if (idx !== -1) {
      memoryStore.projects[idx].name = params[0];
      memoryStore.projects[idx].description = params[1];
      memoryStore.projects[idx].status = params[2];
      memoryStore.projects[idx].priority = params[3];
      memoryStore.projects[idx].start_date = params[4];
      memoryStore.projects[idx].end_date = params[5];
      memoryStore.projects[idx].team_id = params[6] || null;
      memoryStore.projects[idx].budget = parseFloat(params[7] || 0.00);
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  if (cleanSql.includes('delete from projects')) {
    const projId = parseInt(params[0]);
    memoryStore.projects = memoryStore.projects.filter(p => p.id !== projId);
    return { affectedRows: 1 };
  }

  // 5. TASKS QUERIES
  if (cleanSql.includes('from tasks')) {
    let tasksList = memoryStore.tasks.map(t => {
      const assigned = memoryStore.users.find(u => u.id === t.assigned_to);
      const proj = memoryStore.projects.find(p => p.id === t.project_id);
      return {
        ...t,
        assignee_name: assigned ? assigned.full_name : 'Unassigned',
        assignee_avatar: assigned ? assigned.avatar_url : null,
        project_name: proj ? proj.name : ''
      };
    });

    if (cleanSql.includes('where t.task_key =') || cleanSql.includes('where task_key =')) {
      return tasksList.filter(t => t.task_key.toLowerCase() === (params[0] || '').toLowerCase());
    }
    if (cleanSql.includes('where t.id =') || cleanSql.includes('where id =')) {
      return tasksList.filter(t => t.id === parseInt(params[0]));
    }
    return tasksList;
  }

  if (cleanSql.includes('insert into tasks')) {
    const newTask = {
      id: memoryStore.tasks.length + 1,
      task_key: params[0],
      title: params[1],
      description: params[2],
      project_id: parseInt(params[3]),
      assigned_to: params[4] ? parseInt(params[4]) : null,
      created_by: parseInt(params[5]),
      status: params[6] || 'To Do',
      priority: params[7] || 'Medium',
      due_date: params[8] || null,
      estimated_hours: parseFloat(params[9] || 0.00),
      actual_hours: 0.00,
      position: memoryStore.tasks.length + 1,
      created_at: new Date()
    };
    memoryStore.tasks.push(newTask);
    return { insertId: newTask.id, affectedRows: 1 };
  }

  if (cleanSql.includes('update tasks set')) {
    if (cleanSql.includes('status =') && cleanSql.includes('position =')) {
      const taskId = params[2];
      const idx = memoryStore.tasks.findIndex(t => String(t.id) === String(taskId));
      if (idx !== -1) {
        memoryStore.tasks[idx].status = params[0];
        memoryStore.tasks[idx].position = parseInt(params[1]);
        return { affectedRows: 1 };
      }
    } else {
      const taskId = params[params.length - 1];
      const idx = memoryStore.tasks.findIndex(t => String(t.id) === String(taskId));
      if (idx !== -1) {
        memoryStore.tasks[idx].title = params[0] || memoryStore.tasks[idx].title;
        memoryStore.tasks[idx].description = params[1] || memoryStore.tasks[idx].description;
        memoryStore.tasks[idx].status = params[2] || memoryStore.tasks[idx].status;
        memoryStore.tasks[idx].priority = params[3] || memoryStore.tasks[idx].priority;
        memoryStore.tasks[idx].assigned_to = params[4] ? parseInt(params[4]) : null;
        memoryStore.tasks[idx].due_date = params[5] || memoryStore.tasks[idx].due_date;
        memoryStore.tasks[idx].estimated_hours = parseFloat(params[6] || memoryStore.tasks[idx].estimated_hours);
        memoryStore.tasks[idx].actual_hours = parseFloat(params[7] || memoryStore.tasks[idx].actual_hours);
        return { affectedRows: 1 };
      }
    }
    return { affectedRows: 0 };
  }

  if (cleanSql.includes('delete from tasks')) {
    const taskId = params[0];
    memoryStore.tasks = memoryStore.tasks.filter(t => String(t.id) !== String(taskId));
    return { affectedRows: 1 };
  }

  // 6. COMMENTS QUERIES
  if (cleanSql.includes('from comments')) {
    const taskId = params[0] ? parseInt(params[0]) : null;
    return memoryStore.comments
      .filter(c => !taskId || c.task_id === taskId)
      .map(c => {
        const u = memoryStore.users.find(usr => usr.id === c.user_id);
        return {
          ...c,
          user_name: u ? u.full_name : 'Unknown User',
          user_avatar: u ? u.avatar_url : null
        };
      });
  }

  if (cleanSql.includes('insert into comments')) {
    const newComm = {
      id: memoryStore.comments.length + 1,
      task_id: parseInt(params[0]),
      user_id: parseInt(params[1]),
      content: params[2],
      created_at: new Date()
    };
    memoryStore.comments.push(newComm);
    return { insertId: newComm.id, affectedRows: 1 };
  }

  // 7. ATTACHMENTS QUERIES
  if (cleanSql.includes('from attachments')) {
    const taskId = params[0] ? parseInt(params[0]) : null;
    return memoryStore.attachments.filter(a => !taskId || a.task_id === taskId);
  }

  if (cleanSql.includes('insert into attachments')) {
    const newAtt = {
      id: memoryStore.attachments.length + 1,
      task_id: parseInt(params[0]),
      user_id: parseInt(params[1]),
      file_name: params[2],
      file_path: params[3],
      file_size: parseInt(params[4]),
      file_type: params[5],
      created_at: new Date()
    };
    memoryStore.attachments.push(newAtt);
    return { insertId: newAtt.id, affectedRows: 1 };
  }

  // 8. NOTIFICATIONS QUERIES
  if (cleanSql.includes('from notifications')) {
    const userId = params[0] ? parseInt(params[0]) : null;
    return memoryStore.notifications.filter(n => !userId || n.user_id === userId);
  }

  if (cleanSql.includes('update notifications set is_read = 1')) {
    const userId = parseInt(params[0]);
    memoryStore.notifications.forEach(n => {
      if (n.user_id === userId) n.is_read = 1;
    });
    return { affectedRows: 1 };
  }

  if (cleanSql.includes('insert into notifications')) {
    const newNotif = {
      id: memoryStore.notifications.length + 1,
      user_id: parseInt(params[0]),
      title: params[1],
      message: params[2],
      type: params[3] || 'system',
      is_read: 0,
      link: params[4] || null,
      created_at: new Date()
    };
    memoryStore.notifications.push(newNotif);
    return { insertId: newNotif.id, affectedRows: 1 };
  }

  // Generic fallback return empty array or insert id
  if (cleanSql.startsWith('insert')) return { insertId: Math.floor(Math.random() * 1000) + 10, affectedRows: 1 };
  if (cleanSql.startsWith('update') || cleanSql.startsWith('delete')) return { affectedRows: 1 };
  return [];
}

module.exports = {
  query,
  getPool: initPool,
  memoryStore
};
