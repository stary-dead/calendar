FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app


RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*


COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


COPY . .


RUN python manage.py collectstatic --noinput --clear || true


EXPOSE 8000


CMD ["sh", "-c", "python manage.py migrate && python manage.py create_initial_data && daphne -b 0.0.0.0 -p 8000 calendar_project.asgi:application"]
