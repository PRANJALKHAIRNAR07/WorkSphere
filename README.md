# WorkSphere — Smart Project & Team Management Platform

WorkSphere is a production-grade, full-stack enterprise SaaS platform for project management, team collaboration, Kanban workflows, real-time Socket.IO synchronization, and productivity analytics.

---

## 🌟 Key Features

* **Authentication & Strict RBAC**: JWT-based authentication, secure bcrypt password hashing, and role-based access control (`Admin`, `Manager`, `Member`).
* **Interactive SaaS Dashboard**: Real-time project statistics, completion velocity, Chart.js metrics, and overdue task alerts.
* **Kanban Board Workspaces**: Drag-and-drop task reordering, multi-column pipeline (`Backlog`, `To Do`, `In Progress`, `In Review`, `Completed`), and WebSocket sync.
* **Project & Team Management**: Full CRUD for projects, custom key codes (e.g. `WS2-10`), team member assignments, and budget tracking.
* **Task Discussions & Attachments**: Task comments, thread discussions, and file attachment handling.
* **Calendar Timeline**: Milestone deadlines and upcoming task schedules.
* **Analytics & CSV Reports**: Data charts for task velocity, priority breakdown, and one-click CSV report exports.
* **Real-time Notifications**: Unread counter, live notification bell, and user activity alerts.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Chart.js (`react-chartjs-2`), Socket.IO Client, Axios.
* **Backend**: Node.js, Express.js, JWT, bcryptjs, Multer, Socket.IO.
* **Database**: MySQL 8.0+ (with Parameterized `mysql2` Pool in production, and MemoryStore fallback in local dev mode).
* **Testing**: Node Test Runner integration test suite.

---

## 📁 Repository Structure

```
WorkSphere/
├── .gitignore           # Global git ignore configuration
├── .env.example         # Placeholder env template
├── database/            # DDL schemas, seeds, setup script
│   ├── schema.sql
│   ├── seeds.sql
│   └── setup_db.js
├── server/              # Express backend server
│   ├── server.js
│   ├── .env.example
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── sockets/
│   └── tests/
└── client/              # React + Vite + Tailwind frontend
    ├── index.html
    ├── vercel.json      # React SPA rewrite rules for Vercel
    ├── vite.config.js
    ├── .env.example
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        └── services/
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (`node -v`)
- **NPM**: v9.0.0 or higher
- **MySQL**: 8.0+ (Required for live database persistence in production; local sandbox fallback provided when MySQL is offline).

### 2. Database Setup
```bash
# From workspace root
cd database
node setup_db.js
```

### 3. Backend Setup
```bash
cd server
cp .env.example .env
# Edit .env with your local MySQL credentials and JWT secret
npm install
npm test       # Runs API integration tests
npm run dev    # Starts Express API server on http://localhost:5000
```

### 4. Frontend Setup
```bash
cd client
cp .env.example .env
npm install
npm run dev    # Starts Vite dev server on http://localhost:5173
```

---

## 🔑 Pre-seeded Test Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@worksphere.io` | `Password123!` |
| **Manager** | `manager@worksphere.io` | `Password123!` |
| **Member** | `david@worksphere.io` | `Password123!` |

---

## 🌐 Production Deployment Guide

### A. Deploying the Backend on Render

1. **Create Web Service on Render**:
   - Connect your Git repository to Render.
   - Set **Root Directory** to `server`.
   - Set **Environment** to `Node`.
   - Set **Build Command**: `npm install`
   - Set **Start Command**: `npm start`

2. **Configure Environment Variables in Render**:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (Render assigns PORT automatically)
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app`
   - `JWT_SECRET`: `<generate-a-strong-32-char-random-secret>`
   - `JWT_EXPIRES_IN`: `7d`
   - `DB_HOST`: `<your-production-mysql-host>`
   - `DB_PORT`: `3306`
   - `DB_USER`: `<your-production-mysql-user>`
   - `DB_PASSWORD`: `<your-production-mysql-password>`
   - `DB_NAME`: `worksphere_db`

> **Note**: In production (`NODE_ENV=production`), silent fallback to MemoryStore is strictly disabled. A valid MySQL connection is required.

---

### B. Deploying the Frontend on Vercel

1. **Import Project to Vercel**:
   - Connect your Git repository to Vercel.
   - Set **Root Directory** to `client`.
   - Set **Framework Preset** to `Vite`.
   - Build command and output directory (`dist`) will be automatically detected.

2. **Configure Environment Variables in Vercel**:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com/api`
   - `VITE_SOCKET_URL`: `https://your-backend-service.onrender.com`

3. **Deploy**:
   - Click **Deploy**. Vercel will build the frontend bundle and serve all SPA routes using `vercel.json`.

---

## 🧪 Testing & Verification

- **Backend API Tests**: Run `npm test` inside the `server/` directory.
- **Frontend Production Build**: Run `npm run build` inside the `client/` directory.

---

## 📄 License
This project is licensed under the ISC License.
