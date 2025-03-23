# CareerAI - Backend Setup

## Prerequisites
Make sure you have the following installed on your system:
- Python^3.12
- Django
- Docker Desktop

---

## Backend Setup

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/Sejalparate/careerai
cd CareerAI/backend
```

### 2️⃣ Install poetry for managing dependencies
```sh
pip install poetry
```

### 3️⃣ Build Docker Containers
Navigate to the root project folder:
```sh
docker compose build
```

### 4️⃣ Run Containers
```sh
docker compose up -d
```
Your backend should now be running at: **http://localhost:8000/**
For API testing, you can open Swagger UI: **http://localhost:8000/docs**


To stop the containers, press **Ctrl + C** or run:
```sh
docker compose down
```

---
