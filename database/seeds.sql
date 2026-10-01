-- Seed Data for WorkSphere Database
USE `worksphere_db`;

-- Passwords below are hashed versions of 'Password123!' using bcrypt (rounds=10)
-- $2b$10$w3U6s8N7oJ99B... (placeholder hash pattern to be created by auth service or seeded directly)
-- For demonstration/development, these initial rows populate Admin, Manager, and Members.

INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `job_title`, `department`, `status`) VALUES
(1, 'Alex Morgan', 'admin@worksphere.io', '$2a$10$dFMQR/cTZGDyppnFfqPsKOvTJTlcNBldp6SNDJ7SJm8rW0Cwpm.jW', 'Admin', 'Chief Technology Officer', 'Engineering', 'Active'),
(2, 'Sarah Jenkins', 'manager@worksphere.io', '$2a$10$dFMQR/cTZGDyppnFfqPsKOvTJTlcNBldp6SNDJ7SJm8rW0Cwpm.jW', 'Manager', 'Senior Product Manager', 'Product', 'Active'),
(3, 'David Chen', 'david@worksphere.io', '$2a$10$dFMQR/cTZGDyppnFfqPsKOvTJTlcNBldp6SNDJ7SJm8rW0Cwpm.jW', 'Member', 'Full Stack Developer', 'Engineering', 'Active'),
(4, 'Elena Rostova', 'elena@worksphere.io', '$2a$10$dFMQR/cTZGDyppnFfqPsKOvTJTlcNBldp6SNDJ7SJm8rW0Cwpm.jW', 'Member', 'UI/UX Designer', 'Design', 'Active'),
(5, 'Marcus Vance', 'marcus@worksphere.io', '$2a$10$dFMQR/cTZGDyppnFfqPsKOvTJTlcNBldp6SNDJ7SJm8rW0Cwpm.jW', 'Member', 'QA Automation Engineer', 'QA', 'Active');

INSERT INTO `teams` (`id`, `name`, `description`, `created_by`) VALUES
(1, 'Core Engineering', 'Responsible for core platform infrastructure and API development.', 1),
(2, 'Product & Design', 'Product vision, wireframing, component design system, and user experience.', 2);

INSERT INTO `team_members` (`team_id`, `user_id`, `role`) VALUES
(1, 1, 'Owner'),
(1, 3, 'Member'),
(1, 5, 'Member'),
(2, 2, 'Owner'),
(2, 4, 'Member');

INSERT INTO `projects` (`id`, `name`, `key_code`, `description`, `status`, `priority`, `start_date`, `end_date`, `created_by`, `team_id`, `budget`) VALUES
(1, 'WorkSphere 2.0 Web Portal', 'WS2', 'Revamping main platform UI with React, real-time metrics, Kanban board and notifications.', 'In Progress', 'High', '2026-09-01', '2026-11-30', 1, 1, 45000.00),
(2, 'Mobile Client API Integration', 'MOB', 'REST API and WebSocket gateway for upcoming iOS and Android applications.', 'Planning', 'Medium', '2026-10-15', '2026-12-20', 2, 1, 28000.00),
(3, 'Design System Refresh', 'DSR', 'Unified component library, color palette, dark mode system, and typography tokens.', 'In Progress', 'Urgent', '2026-09-10', '2026-10-31', 2, 2, 15000.00);

INSERT INTO `project_members` (`project_id`, `user_id`, `project_role`) VALUES
(1, 1, 'Lead'),
(1, 3, 'Contributor'),
(1, 4, 'Contributor'),
(1, 5, 'Contributor'),
(2, 1, 'Lead'),
(2, 3, 'Contributor'),
(3, 2, 'Lead'),
(3, 4, 'Contributor');

INSERT INTO `tasks` (`id`, `task_key`, `title`, `description`, `project_id`, `assigned_to`, `created_by`, `status`, `priority`, `due_date`, `estimated_hours`, `actual_hours`, `position`) VALUES
(1, 'WS2-1', 'Setup Auth JWT Middleware & Express Routes', 'Implement registration, login, token refresh, and role-based permissions checking.', 1, 3, 1, 'Completed', 'High', '2026-09-15', 12.00, 10.50, 1),
(2, 'WS2-2', 'Build Interactive Kanban Board', 'Implement drag and drop task movement across status columns with Socket.IO syncing.', 1, 3, 1, 'In Progress', 'Urgent', '2026-10-05', 24.00, 14.00, 1),
(3, 'WS2-3', 'Design Modern Dark & Light Mode Theme', 'Create Tailwind design system tokens, typography scales, glassmorphism cards and layout sidebar.', 1, 4, 2, 'In Progress', 'High', '2026-10-08', 18.00, 8.00, 2),
(4, 'WS2-4', 'End-to-End API Security Audit', 'Check parameterized SQL queries, JWT expiration handling, XSS protection, and rate limiting.', 1, 5, 1, 'To Do', 'Medium', '2026-10-20', 16.00, 0.00, 1),
(5, 'WS2-5', 'Analytics & Productivity Charts Integration', 'Integrate Chart.js for project metrics, task velocity, team workload distribution, and CSV export.', 1, 3, 2, 'To Do', 'Medium', '2026-10-25', 20.00, 0.00, 2);

INSERT INTO `comments` (`id`, `task_id`, `user_id`, `content`) VALUES
(1, 2, 1, 'Please ensure drag-and-drop triggers real-time updates via Socket.IO for all connected workspace members.'),
(2, 2, 3, 'Working on the drag-and-drop state sync now. Integrating HTML5 Drag & Drop with state optimistic UI update.');

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `link`) VALUES
(1, 3, 'New Task Assigned', 'You have been assigned to task "Build Interactive Kanban Board" in WorkSphere 2.0 Web Portal', 'task_assigned', 0, '/projects/1/tasks/2'),
(2, 4, 'Project Invitation', 'You were added to project "Design System Refresh" as Contributor', 'project_invite', 1, '/projects/3');
