# Student Information Management System

A production-ready implementation of **Project 1: Student Information Management System**, designed and deployed strictly according to the **Three-Tier Cloud Architecture** assignment specification.

---

## Architecture Overview

```mermaid
flowchart TD
    subgraph PresentationTier ["Presentation Tier (Frontend)"]
        A["React 18 + Vite SPA<br/>(Hosted on Netlify)"]
    end

    subgraph ApplicationTier ["Application Tier (Backend API)"]
        B["Node.js + Express.js REST API<br/>(Hosted on Render)"]
    end

    subgraph DataTier ["Data Tier (Database)"]
        C[("MongoDB Atlas<br/>Database: studentDB<br/>Collection: students")]
    end

    A -->|"HTTPS / REST (JSON)<br/>VITE_API_BASE_URL"| B
    B -->|"Mongoose TLS/TCP<br/>MONGODB_URI"| C
    B -.->|"CORS Origin Validation<br/>CLIENT_URL"| A
```

| Tier | Technology | Cloud Platform | Purpose |
| :--- | :--- | :--- | :--- |
| **Presentation Tier** | React.js (Vite) | **Netlify** | Responsive dashboard, CRUD forms, search, notifications, live status |
| **Application Tier** | Node.js + Express.js | **Render** | REST API endpoints, business logic, CORS security, input validation |
| **Data Tier** | MongoDB + Mongoose | **MongoDB Atlas** | Managed cloud database (`studentDB`), student records collection (`students`) |

---

## Key Features

1. **Add Student:** Create new student records with input validation and duplicate `studentId` prevention.
2. **View All Students:** Responsive table with student metadata, department tags, and semester badges.
3. **Search by Student ID:** Instant human-readable search by `studentId` (e.g., `STU-101`), student name, or department.
4. **Update Student Details:** In-place edit workflow with pre-filled fields and duplicate conflict checking.
5. **Delete Student:** Safe record deletion with confirmation modal displaying the target student's name and ID.
6. **User Feedback:** Clear, color-coded success and error notification banners with dismiss controls.
7. **Persistence:** All records are persisted in MongoDB Atlas under database `studentDB` and collection `students`.
8. **Live Diagnostics:** Non-sensitive backend and database connectivity badge in the top navigation bar.

---

## Student Data Model

All records conform to the following schema within the `students` collection:

| Field | Type | Required | Description / Validation Rules |
| :--- | :--- | :--- | :--- |
| `studentId` | `String` | Yes | Unique identifier (2–20 alphanumeric chars, e.g., `STU2026-001`, uppercase) |
| `name` | `String` | Yes | Student's full name (2–100 characters) |
| `email` | `String` | Yes | Valid email format (e.g., `student@university.edu`, unique lowercase) |
| `department` | `String` | Yes | Academic department (e.g., `Computer Science & Engineering`) |
| `semester` | `Number` | Yes | Current semester (integer between `1` and `12`) |
| `contact` | `String` | Yes | Contact phone number (7–20 digits/valid phone characters) |
| `createdAt` | `Date` | Auto | Timestamp when student was added |
| `updatedAt` | `Date` | Auto | Timestamp when record was last updated |

---

## Directory Structure

```text
student-management-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Mongoose connection to Atlas (studentDB)
│   │   ├── controllers/
│   │   │   └── studentController.js  # CRUD and search handlers
│   │   ├── models/
│   │   │   └── Student.js            # Mongoose Schema targeting collection 'students'
│   │   ├── routes/
│   │   │   ├── studentRoutes.js      # /api/students endpoints
│   │   │   └── healthRoutes.js       # /api/health endpoint
│   │   ├── middleware/
│   │   │   └── errorHandler.js       # Centralized error handler
│   │   └── server.js                 # Express app & CORS policy
│   ├── test-backend.js               # Smoke test script for endpoints & health
│   ├── .env.example                  # Backend environment template
│   ├── .gitignore                    # Excludes node_modules, .env
│   ├── package.json                  # Backend dependencies & scripts
│   └── render.yaml                   # Render deployment blueprint
│
├── frontend/
│   ├── public/
│   │   └── _redirects                # Netlify SPA rewrite rule (/* /index.html 200)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Header & live system status badge
│   │   │   ├── StatusBanner.jsx      # Success/error alert banner
│   │   │   ├── StudentForm.jsx       # Add & edit student form
│   │   │   ├── StudentSearch.jsx     # Search bar with count & reset
│   │   │   ├── StudentTable.jsx      # Student data table & action buttons
│   │   │   └── DeleteModal.jsx       # Deletion confirmation modal
│   │   ├── services/
│   │   │   └── api.js                # API client with VITE_API_BASE_URL
│   │   ├── App.jsx                   # Central state management & orchestration
│   │   ├── main.jsx                  # React 18 DOM mount
│   │   └── index.css                 # Modern CSS styles & responsive layout
│   ├── .env.example                  # Frontend environment template
│   ├── .gitignore                    # Excludes node_modules, dist, .env
│   ├── index.html                    # HTML shell
│   ├── netlify.toml                  # Netlify build & redirect configuration
│   ├── package.json                  # Frontend dependencies & scripts
│   └── vite.config.js                # Vite build setup
│
├── render.yaml                       # Root Render Blueprint
├── .gitignore                        # Monorepo gitignore
├── package.json                      # Root orchestration scripts
└── README.md                         # This documentation
```

---

## API Specification & Sample Requests

Base URL (Local): `http://localhost:5000`  
Base URL (Production): `https://<your-render-service>.onrender.com`

### 1. Health Check
* **Endpoint:** `GET /api/health`
* **Description:** Diagnostic status of the API server and MongoDB Atlas connection without exposing sensitive credentials.
* **Sample Request:**
  ```bash
  curl -X GET http://localhost:5000/api/health
  ```
* **Sample Response (200 OK):**
  ```json
  {
    "status": "healthy",
    "service": "Student Information Management System API",
    "timestamp": "2026-10-14T10:20:43.703Z",
    "uptimeSeconds": 142,
    "environment": "development",
    "database": {
      "status": "connected",
      "connected": true,
      "databaseName": "studentDB"
    }
  }
  ```

### 2. View All Students
* **Endpoint:** `GET /api/students`
* **Query Parameters:**
  * `search` (optional): Case-insensitive search on `studentId`, `name`, `department`, or `email`.
  * `studentId` (optional): Exact filter by human-readable student ID.
* **Sample Request:**
  ```bash
  curl -X GET "http://localhost:5000/api/students?search=STU-101"
  ```
* **Sample Response (200 OK):**
  ```json
  {
    "success": true,
    "count": 1,
    "data": [
      {
        "_id": "670ce1a3b8214f0012abc123",
        "studentId": "STU-101",
        "name": "Jane Doe",
        "email": "jane.doe@university.edu",
        "department": "Computer Science & Engineering",
        "semester": 4,
        "contact": "+1 (555) 019-2834",
        "createdAt": "2026-10-14T10:15:00.000Z",
        "updatedAt": "2026-10-14T10:15:00.000Z"
      }
    ]
  }
  ```

### 3. Get Student by ID
* **Endpoint:** `GET /api/students/:id`
* **Description:** Fetches a single student using either their `studentId` (e.g. `STU-101`) or MongoDB `_id`.
* **Sample Request:**
  ```bash
  curl -X GET http://localhost:5000/api/students/STU-101
  ```

### 4. Add Student
* **Endpoint:** `POST /api/students`
* **Headers:** `Content-Type: application/json`
* **Sample Request:**
  ```bash
  curl -X POST http://localhost:5000/api/students \
    -H "Content-Type: application/json" \
    -d '{
      "studentId": "STU-101",
      "name": "Jane Doe",
      "email": "jane.doe@university.edu",
      "department": "Computer Science & Engineering",
      "semester": 4,
      "contact": "+1 (555) 019-2834"
    }'
  ```
* **Sample Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Student record created successfully",
    "data": {
      "_id": "670ce1a3b8214f0012abc123",
      "studentId": "STU-101",
      "name": "Jane Doe",
      "email": "jane.doe@university.edu",
      "department": "Computer Science & Engineering",
      "semester": 4,
      "contact": "+1 (555) 019-2834"
    }
  }
  ```

### 5. Update Student
* **Endpoint:** `PUT /api/students/:id`
* **Sample Request:**
  ```bash
  curl -X PUT http://localhost:5000/api/students/STU-101 \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Jane Doe",
      "department": "Data Science & AI",
      "semester": 5,
      "contact": "+1 (555) 999-8888"
    }'
  ```
* **Sample Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Student details updated successfully",
    "data": {
      "studentId": "STU-101",
      "name": "Jane Doe",
      "department": "Data Science & AI",
      "semester": 5,
      "contact": "+1 (555) 999-8888"
    }
  }
  ```

### 6. Delete Student
* **Endpoint:** `DELETE /api/students/:id`
* **Sample Request:**
  ```bash
  curl -X DELETE http://localhost:5000/api/students/STU-101
  ```
* **Sample Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Student 'Jane Doe' (STU-101) deleted successfully",
    "data": {
      "id": "670ce1a3b8214f0012abc123",
      "studentId": "STU-101"
    }
  }
  ```

---

## Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Description | Example (Local) | Example (Render Production) |
| :--- | :--- | :--- | :--- |
| `PORT` | HTTP port for Express | `5000` | `10000` (Assigned by Render) |
| `NODE_ENV` | Environment mode | `development` | `production` |
| `MONGODB_URI` | MongoDB Atlas Connection String pointing to `studentDB` | `mongodb+srv://user:pass@cluster.mongodb.net/studentDB?retryWrites=true&w=majority` | `mongodb+srv://user:pass@cluster.mongodb.net/studentDB?retryWrites=true&w=majority` |
| `CLIENT_URL` | Authorized CORS origin(s) | `http://localhost:5173` | `https://your-frontend.netlify.app` |

### Frontend (`frontend/.env`)
| Variable | Description | Example (Local) | Example (Netlify Production) |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Base URL of Express REST API | `http://localhost:5000/api` | `https://your-backend.onrender.com/api` |

---

## Local Development & Testing Guide

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create your `.env` file from the example:
   ```bash
   copy .env.example .env
   ```
3. Update `MONGODB_URI` with your MongoDB Atlas connection string.
4. Run automated backend validation:
   ```bash
   npm test
   ```
5. Start the backend in development mode:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Create your `.env` file:
   ```bash
   copy .env.example .env
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
4. Access the web dashboard at `http://localhost:5173`.

### 3. Production Build Verification
To test the production build for frontend:
```bash
cd frontend
npm run build
```
This generates optimized static files inside `frontend/dist`.

---

## Cloud Deployment Walkthrough

### Step 1: Configure MongoDB Atlas (Database Tier)
1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster (**M0 Free Tier**).
3. Under **Security > Database Access**:
   * Add a new database user (e.g., `studentAdmin`).
   * Choose **Password Authentication** and set a secure password.
   * Assign Built-in Role: **Read and write to any database**.
4. Under **Security > Network Access**:
   * Click **Add IP Address**.
   * Select **Allow Access From Anywhere** (`0.0.0.0/0`).  
     *(Render uses dynamic outgoing IP addresses; this setting is required so Render can connect).*
5. Under **Deployment > Database**:
   * Click **Connect** > **Drivers** (Node.js).
   * Copy the connection string. Replace `<username>` and `<password>`, and append `/studentDB`:
     ```text
     mongodb+srv://studentAdmin:<password>@cluster0.xxxxx.mongodb.net/studentDB?retryWrites=true&w=majority
     ```

### Step 2: Deploy Backend to Render (Application Tier)
1. Push your project to a GitHub or GitLab repository.
2. Sign in to [Render](https://render.com/).
3. Click **New +** > **Web Service**.
4. Connect your Git repository.
5. Configure the service:
   * **Name:** `student-management-api`
   * **Root Directory:** `backend`
   * **Runtime:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `node src/server.js`
   * **Instance Type:** `Free`
6. Under **Environment Variables**, add:
   * `NODE_ENV`: `production`
   * `MONGODB_URI`: `<Your MongoDB Atlas connection URI>`
   * `CLIENT_URL`: `*` *(temporarily allow until frontend is deployed, then restrict)*
7. Click **Create Web Service**.
8. Once deployed, note your service URL (e.g. `https://student-management-api.onrender.com`).
9. Test the live health endpoint in your browser:
   `https://student-management-api.onrender.com/api/health`

### Step 3: Deploy Frontend to Netlify (Presentation Tier)
1. Sign in to [Netlify](https://www.netlify.com/).
2. Click **Add new site** > **Import an existing project**.
3. Connect your Git repository.
4. Configure the build settings:
   * **Base directory:** `frontend`
   * **Build command:** `npm run build`
   * **Publish directory:** `frontend/dist`
5. Under **Environment variables**, click **Add a variable**:
   * Key: `VITE_API_BASE_URL`
   * Value: `https://<your-render-service>.onrender.com/api`
6. Click **Deploy student-management-frontend**.
7. Note your live Netlify site URL (e.g., `https://student-management-portal.netlify.app`).

### Step 4: Secure Production CORS Handshake
1. Return to your backend dashboard on **Render**.
2. Navigate to **Environment**.
3. Update `CLIENT_URL` to your exact Netlify domain:
   * `CLIENT_URL`: `https://student-management-portal.netlify.app`
4. Render will automatically redeploy the backend with strict CORS protection.

---

## Final Demonstration Checklist

Use this checklist during your assignment demonstration:

- [ ] **Architecture Check:**
  - [ ] Frontend URL is on `*.netlify.app`
  - [ ] Backend URL is on `*.onrender.com`
  - [ ] Database is on MongoDB Atlas (`studentDB`, collection `students`)
- [ ] **Health & Diagnostics:**
  - [ ] `GET /api/health` returns `status: "healthy"` and `database.connected: true`
  - [ ] Header badge in React UI displays "Atlas Connected (studentDB)"
- [ ] **Feature 1 — Add Student:**
  - [ ] Submit student record (e.g. ID: `CS-2026-01`, Name: `John Doe`)
  - [ ] Success message banner appears
  - [ ] New record appears immediately in the table
- [ ] **Feature 2 — View All Students:**
  - [ ] Table renders all 6 required fields: Student ID, Name, Email, Department, Semester, Contact
- [ ] **Feature 3 — Search Student:**
  - [ ] Enter `CS-2026-01` into the search bar and click Search
  - [ ] Table filters to show only the matching student
  - [ ] Click "Reset to All Students" to view full directory
- [ ] **Feature 4 — Update Student:**
  - [ ] Click the Edit button on an existing student
  - [ ] Form populates with current values
  - [ ] Update semester or department and save
  - [ ] Updated details reflect instantly in the table
- [ ] **Feature 5 — Delete Student:**
  - [ ] Click the Delete button
  - [ ] Confirmation modal appears displaying the student's name and ID
  - [ ] Confirm deletion
  - [ ] Record disappears from table with success notification
- [ ] **Feature 6 — Persistence Verification:**
  - [ ] Refresh the Netlify browser tab; all records remain intact
  - [ ] Open MongoDB Atlas Collections dashboard; verify documents in `studentDB.students`
- [ ] **Feature 7 — Error Handling:**
  - [ ] Attempt adding a student with duplicate `studentId` -> Clean error banner appears ("A student with student ID already exists")
  - [ ] Attempt submitting empty or invalid email/contact -> Field-level error validation highlights the invalid fields
