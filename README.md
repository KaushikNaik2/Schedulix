# Schedulix: Faculty Coordination Platform

![Java](https://img.shields.io/badge/Java-17-DB0000?style=for-the-badge&logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

Schedulix is a full-stack web application designed to streamline and modernize the communication and scheduling process between students and faculty.

This platform replaces outdated methods like email chains and physical office-hour sheets with a centralized, real-time, and user-friendly system. Students can instantly view faculty timetables and availability, while faculty can manage their schedules and broadcast information with ease.

### [View Live Demo (Placeholder)](https://your-demo-url.com)

*(Suggestion: Add a screenshot of your application's dashboard here)*

---

## 🚀 Core Features

Schedulix is divided into two primary user roles, **Student** and **Faculty**, each with a custom-tailored experience.

### 🔑 Authentication & User Management
* **Role-Based Authentication:** Secure login for Students and Faculty.
* **JWT Security:** Stateless API authentication using JSON Web Tokens.
* **Complex Registration:** Full user registration including name, email, department, and role.
* **Secure "Forgot Password" Flow:** A 3-step password reset process using hashed security questions and answers.
* **Dark Mode:** A persistent light/dark mode theme toggle for user comfort, saved to `localStorage`.
* *(Planned)* **Google OAuth2 Login:** Integration with Google for social sign-on.

### 🧑‍🎓 Student Features
* **Faculty Availability:** View a live list of all faculty and their current status (e.g., "Available", "In Class", "Off Campus").
* **Meeting Scheduling:** Request a meeting with a faculty member by selecting a date, time, and topic.
* **My Meetings:** A dashboard to view the status (Pending, Approved, Denied) of all submitted requests.
* **View Announcements:** Receive broadcasted messages from faculty.
* **Real-time Notifications:** Get notified when a meeting request is approved or denied.

### 🧑‍🏫 Faculty Features
* **Meeting Management:** A dashboard to view and manage all incoming meeting requests (Approve/Deny).
* **Timetable Management:** Ability to upload an Excel (`.xlsx`) file to parse and set their weekly timetable.
* **Create Announcement:** A rich text editor to write and broadcast announcements to all students.

---

## 💻 Tech Stack

This project is built with a modern, decoupled, full-stack architecture.

### **Backend (Schedulix_BE)**
* **Framework:** Spring Boot 3
* **Language:** Java 17
* **Security:** Spring Security 6 (with JWT)
* **Database:** Spring Data JPA (Hibernate)
* **Build Tool:** Maven
* **Validation:** `spring-boot-starter-validation` for API requests.
* **File Parsing:** Apache POI for reading `.xlsx` timetable files.
* **Code Quality:** Lombok

### **Frontend (Schedulix_FE)**
* **Framework:** React 18 (with Vite)
* **Routing:** `react-router-dom`
* **State Management:** React Context API (`AuthContext`, `ThemeContext`)
* **Styling:** Tailwind CSS (for core UI) & custom CSS (`AuthPage.css` for animations)
* **API Client:** `fetch` API (wrapped in a custom `api.js` service)
* **Icons:** `lucide-react`

### **🗃️ Database**
* **Relational Database:** MySQL 8

---

## ⚙️ Setup & Installation

To run this project locally, you will need **two** separate terminals or you can use the provided helper script to start both parts at once.

**Prerequisites:**
* JDK 17 (or newer)
* Apache Maven 3.8 (or newer)
* Node.js 18 (or newer)
* A running MySQL 8 server instance

We now provide start-dev.sh to make starting the app easier. The script will build and run the backend and start the frontend dev server for you.

### Option A — Recommended: start-dev.sh (single-command)
1.  **Create Database (one-time):**
    * Log into your MySQL server and create the database:
      ```sql
      CREATE DATABASE schedulix;
      ```
2.  **Configure Database Credentials:**
    * Open `src/main/resources/application.properties` (backend) and update:
      - `spring.datasource.username`
      - `spring.datasource.password`
      - (optionally) `spring.datasource.url` if your MySQL is not on localhost/default port
3.  **Make the script executable (if needed) and run it:**
    ```bash
    chmod +x start-dev.sh
    ./start-dev.sh
    ```
    What this does:
    * Builds and runs the backend (Spring Boot) and starts the frontend dev server (Vite).
    * Backend: http://localhost:8080
    * Frontend: http://localhost:5173

    Note: If your environment requires additional environment variables (e.g., custom ports or DB URL), set them before running the script or update the script accordingly.

### Option B — Manual (two terminals)
If you prefer to run backend and frontend manually, follow these steps.

#### 1. Backend (Runs on `localhost:8080`)
1.  **Navigate to the Backend Folder:**
    ```bash
    cd schedulix-backend
    # Or your backend folder name (e.g., Schedulix_BE)
    ```
2.  **Create Database (if not done already):**
    ```sql
    CREATE DATABASE schedulix;
    ```
3.  **Configure Credentials:**
    * Open `src/main/resources/application.properties`.
    * Update `spring.datasource.username` and `spring.datasource.password` to match your MySQL user.
4.  **Build the Project:**
    ```bash
    mvn clean install
    ```
5.  **Run the Server:**
    ```bash
    mvn spring-boot:run
    ```
    The backend API will now be running at `http://localhost:8080`.

#### 2. Frontend (Runs on `localhost:5173`)
1.  **Navigate to the Frontend Folder:**
    ```bash
    cd schedulix-frontend
    # Or your frontend folder name (e.g., Schedulix_FE)
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    The React application will open at `http://localhost:5173`. You can now register a new user.

---

## 🤝 Team Roles & Work Division

This project's development can be broken down into four distinct roles, perfect for a team of four.

### **Role 1: Shivam Pandey (Team Lead (Backend & Database))**
* **Responsibilities:** Manages the overall project, Git repository, and the core database/security setup.
* **Key Tasks:**
    * Designing the MySQL database schema (User, MeetingRequest, etc.).
    * Setting up the Spring Boot project (`pom.xml`).
    * Implementing the `User.java` model and `SecurityConfig.java` (JWT, CORS).
    * Managing the main Git branches and merging team contributions.

### **Role 2: Kaushik Naik (Backend Developer (API & Logic))**
* **Responsibilities:** Builds the API endpoints and the business logic that powers all features.
* **Key Tasks:**
    * Writing all controllers (`AuthController`, `MeetingRequestController`, etc.).
    * Writing all services (`AuthService`, `TimetableService`, etc.).
    * Implementing the "Forgot Password" validation and logic.
    * Handling the Excel file parsing with Apache POI.
    * Creating all DTOs (`RegisterRequest`, `MeetingRequestDTO`).

### **Role 3: Raksha Poojary (Frontend Developer (UI & Styling))**
* **Responsibilities:** Implements the application's visual design, layout, and custom styling.
* **Key Tasks:**
    * Translating the UI mockups into React components.
    * Writing all custom CSS in `AuthPage.css` for the sliding panels and modals.
    * Implementing the "Dark Mode" feature and all `html.dark` CSS overrides.
    * Ensuring the application is responsive on mobile and desktop.

### **Role 4: Aditya Mishra (Frontend Developer (State & API Integration))**
* **Responsibilities:** Manages the application's state and connects the UI to the backend API.
* **Key Tasks:**
    * Building the `api.js` service to handle all `fetch` requests.
    * Implementing the `AuthContext.jsx` and `ThemeContext.jsx` to manage user sessions and themes.
    * Connecting all forms (Login, Register, Schedule Meeting) to the API service.
    * Implementing the real-time notification polling system.
    * Managing all error handling (e.g., "Login failed," "Invalid role") in the UI.

---

### Keywords
`spring-boot` `react` `java` `mysql` `full-stack` `mini-project` `jwt` `scheduling-app` `tailwind-css` `spring-security` `jpa` `maven` `vite`
