# 🚀 Ethara.ai Team Task Manager

A professional, full-stack MERN (MongoDB, Express, React, Node.js) application designed for high-performance team collaboration and task orchestration. This project features a modern "Glassmorphism" UI, role-based access control, and real-time dashboard synchronization.

---

## 🔑 Getting Started

To get started with the Task Manager, please refer to the **Installation & Setup** section below. You can create your own Admin and Member accounts using the built-in Signup functionality.

---

## ✨ Core Functionalities

### 1. Dual-Role Architecture (RBAC)
*   **Admin Power:** Complete oversight of all projects, tasks, and users. Admins can create, edit, and delete any resource.
*   **Member Focus:** A personalized experience where members only see tasks assigned to them or available for "Acceptance" within their projects.

### 2. Dynamic Dashboard & Real-Time Sync
*   **Live Analytics:** Interactive charts (Doughnut & Bar) tracking task distribution and progress.
*   **Auto-Sync Polling:** The dashboard automatically refreshes every **30 seconds** without a page reload, ensuring the team is always in sync with the latest status changes.
*   **Metric Cards:** High-level overview of Total Projects, Total Tasks, Completed, In-Progress, and Overdue items.

### 3. The "Accept Task" Workflow (Self-Service Delegation)
*   Instead of waiting for assignments, members can browse projects and click the **"Accept Task"** button on unassigned items.
*   This instantly assigns the task to them and pushes it into their personal Todo list.

### 4. Kanban-Style Management
*   A visual drag-and-drop style Kanban board for organizing tasks into **Todo**, **In Progress**, and **Done**.
*   **Quick Actions:** Members can update task status with a single click via a specialized "Quick Update" modal.

### 5. Advanced Task Tracking
*   **Overdue Indicators:** Tasks that pass their deadline are automatically flagged in red for immediate attention.
*   **Priority System:** High, Medium, and Low priority levels with visual color coding.
*   **Comments System:** Integrated comment section for every task to facilitate team discussion.

---

## 🛠️ Technology Stack

*   **Frontend:** React.js, Vite, Lucide Icons, Chart.js, Axios, React Router.
*   **Backend:** Node.js, Express.js.
*   **Database:** MongoDB with Mongoose ODM.
*   **Security:** JWT (JSON Web Tokens) for authentication, Bcrypt for password hashing.
*   **Styling:** Modern Vanilla CSS (Glassmorphism design system).

---

## 🚀 Installation & Setup

1.  **Clone the Repository:**
    ```bash
    git clone [repository-url]
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    npm install
    # Create a .env file with:
    # PORT=5000
    # MONGO_URI=your_mongodb_uri
    # JWT_SECRET=your_secret_key
    ```

3.  **Frontend Setup:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---

## 🎤 Project Philosophy
> *"This application uses a 'Push-Pull' delegation model. Admins can push tasks directly to members, or members can proactively 'Accept' unassigned tasks from the project pool. To solve the problem of data staleness, an auto-sync mechanism keeps the dashboard metrics live across all team roles without requiring manual refreshes."*
