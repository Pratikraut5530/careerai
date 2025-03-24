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

To stop the containers, press **Ctrl + C** or run:
```sh
docker compose down
```

### 5️⃣ Django setup

```sh
cd careerai
python manage.py createsuperuser    # Create superuser here
python manage.py makemigrations
python manage.py migrate
python manage.py runserver     # Run this command if running locally, no need to run it if docker container is running
```
For Admin panel: **http://localhost:8000/admin/**

---
