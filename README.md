# CareerAI - Backend Setup

## Prerequisites
Make sure you have the following installed on your system:
- Python^3.10
- Django
- Docker Desktop

---

## Backend Setup

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/your-repo/CareerAI.git
cd CareerAI/backend
```

### 2️⃣ Create a Virtual Environment & Install Dependencies
```sh
pip install -r requirements.txt
```

### 3️⃣ Build Docker Containers
Navigate to the root project folder:
```sh
docker-compose build
```

### 4️⃣ Run Containers
```sh
docker-compose up -d
```
Your backend should now be running at: **http://localhost:8000/**
For API testing, you can open Swagger UI: **http://localhost:8000/docs**


To stop the containers, press **Ctrl + C** or run:
```sh
docker-compose down
```

---
