# Use Python base image
FROM python:3.10

# Set working directory inside the container
WORKDIR /app

# Copy the backend files into the container
COPY . /app

# Install dependencies
RUN pip install --no-cache-dir poetry
RUN poetry install --no-root

# Expose the port Django runs on
EXPOSE 8000

# Run Django server (fixing the path issue)
CMD ["poetry", "run", "python", "careerai/manage.py", "runserver", "0.0.0.0:8000"]
