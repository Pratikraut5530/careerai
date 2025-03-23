FROM python:3.10

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Set the working directory inside the container
WORKDIR /app

# Install Poetry
RUN pip install --upgrade pip \
    && pip install poetry

COPY pyproject.toml poetry.lock /app/

# Install dependencies using Poetry
RUN poetry config virtualenvs.create false \
    && poetry install --no-root --no-interaction --no-ansi

COPY . /app/

WORKDIR /app/careerai

# Expose port 8000 for Django
EXPOSE 8000

# Default command to run the Django server
CMD ["poetry", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]
