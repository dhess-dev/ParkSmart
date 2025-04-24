[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/VDZkeWDy)
[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=19273914&assignment_repo_type=AssignmentRepo)

---
### 💬 Commit Guidelines

> ⚠️ Please follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) when committing changes.

Examples:

- `feat: add login form`
- `fix: correct API endpoint`
- `docs: update README with setup info`

### ✅ Project Structure
```bash

Cyberphysisches_System_Parkhaus/
├── frontend/    # Vite + React app
├── backend/     # Spring Boot app
└── README.md
```

## 🚀 How to Run This Project

This is a fullstack application consisting of:

- `frontend/` – built with **React + Vite**
- `backend/` – built with **Spring Boot (Java 17)**

---

### 🧪 Requirements

Make sure you have the following installed:

- Node.js 18+ and npm
- Java 17 (or use `nix-shell` with `openjdk`)
- Gradle (comes with the project via `./gradlew`)

---

### ▶️ Running the Backend (Spring Boot)

```bash
cd backend
./gradlew bootRun
```

Your backend server will be available at:
👉 http://localhost:8080

It exposes a simple API like:

```bash
GET /api/hello
```

### ⚛️ Running the Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```
Your frontend will start at:
👉 http://localhost:5173

It automatically fetches data from the Spring Boot backend.

### 📘 Run Backend with Live API Docs (Scalar)

⚠️ WSL (Windows Subsystem for Linux) is required on Windows to use this script.

To launch the Spring Boot backend together with live API documentation powered by Scalar, run:


```bash
./backend/scripts/run-dev.sh
```

This script will:

✅ Start the Spring Boot backend at http://localhost:8080

✅ Wait until it's ready

✅ Generate the OpenAPI spec

✅ Launch Scalar API docs at http://localhost:3000

Requires: Node.js and internet (for first-time npx usage).

Perfect for exploring and documenting your API while you build.

### 🧹 .gitignore
Unnecessary files like node_modules/, build/, .gradle/, etc. are excluded using .gitignore.