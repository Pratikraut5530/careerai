# CareerAI - Backend Setup

## Prerequisites
Make sure you have the following installed on your system:
- Python^3.10
- Poetry
- Django
- Docker Desktop

---

## Backend Setup

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/your-repo/CareerAI.git
cd CareerAI/backend
```

### 2️⃣ Install Poetry for Package Management
```sh
pip install poetry
```

### 3️⃣ Create a Virtual Environment & Install Dependencies
```sh
poetry install
```

### 4️⃣ Build Docker Containers
Navigate to the root project folder:
```sh
docker-compose build
```

### 5️⃣ Run Containers
```sh
docker-compose up -d
```
Your backend should now be running at: **http://localhost:8000/**

To stop the containers, press **Ctrl + C** or run:
```sh
docker-compose down
```

---
