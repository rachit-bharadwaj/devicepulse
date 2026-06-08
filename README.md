# 🌐 Device Pulse

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
</p>

Device Pulse is a real-time network diagnostics monitoring system designed for device/assets management. It is built using Angular for frontend and FastAPI with PostgreSQL for backend. It has features like real-time monitoring of devices and alerts. Also, it has a user management system and role-based access control.

---

## 🗺️ Table of Contents
1. [✨ Key Features](#-key-features)
2. [📐 Architecture & Tech Stack](#-architecture--tech-stack)
3. [🛠️ Quick Start & Installation](#%EF%B8%8F-quick-start--installation)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
4. [📑 Technical Assessment: Part 4 Answers](#-technical-assessment-part-4-answers)

---

## ✨ Key Features

*   **⚡ Real-Time Monitoring**: Persistent duplex WebSockets deliver instant status changes (UP/DOWN/Warning) and simulated latency logs to the active client grid without manual polling.
*   **🎨 Dual UI Themes**:
    *   **Modern Glassmorphic Theme**: A dark mode with glass-panel elements, HSL color tokens, and custom-imported clean SVG vectors.
    *   **Retro XP Theme**: A retro styled interface including file menus, desktop icons, live address bar navigation, and system tray status notification balloons.
*   **🛡️ Role-Based Authorizations**: Built-in OAuth2 JWT security gates. Only users authenticated with the `ADMIN` role are granted access to manage operating profiles.
*   **👥 Operator Management Portal**: Dynamic, theme-aware CRUD panel allowing administrators to register, update credentials, toggle access privileges, and delete dashboard profiles.

---

## 📐 Tech Stack

### Frontend Architecture
*   **Framework**: Angular using reactive signals for high-performance, single-directional state updates.
*   **Styling**: Tailwind CSS inline styles along with custom css for specific stylings.
*   **Icons**: Heroicons svg used within the code blocks.

### Backend Architecture
*   **Framework**: FastAPI (Python) utilizing asynchronous event loops for rapid HTTP request handling and WebSocket connections.
*   **ORMs & Database**: SQLAlchemy coupled with PostgreSQL hosted on Supabase for relational database management.
*   **Authentication**: PyJWT secure access token generation with role credentials verified on all resource paths.

---

## 🛠️ Quick Start & Installation

> [!NOTE]
> Ensure you have Python 3.10+ and Node.js 18+ installed on your local environment before executing setup commands.

### Backend Setup

1. **Navigate to the Backend Directory**:
   ```bash
   cd backend
   ```
2. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` root:
   ```env
   DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<dbname>
   PORT=8000
   ENVIRONMENT=development
   ```
3. **Install Packages**:
   Using `uv` (recommended):
   ```bash
   uv sync
   ```
4. **Boot Up Backend**:
   ```bash
   uv run main.py
   ```
   *Interactive Swagger documents will become available at `http://localhost:8000/docs`.*

---

### Frontend Setup

1. **Navigate to the Web Directory**:
   ```bash
   cd ../web
   ```
2. **Install Node Packages**:
   ```bash
   npm install
   ```
3. **Boot Up Development Server**:
   ```bash
   npm run start
   ```
4. **Preview**:
   Open your browser and navigate to `http://localhost:3000`.

---
