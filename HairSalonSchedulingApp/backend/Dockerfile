FROM python:3.11-slim
EXPOSE 5008

# 1) Install all system dependencies in one go
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      libpq-dev \
      libmagic-dev \
      libmagic1 \
      postgresql-client \
      gcc \
      python3-dev \
      build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create app directory structure and set permissions
RUN mkdir -p /app/app/static/profile_pictures && \
    chmod 777 /app/app/static/profile_pictures

# 2) Upgrade pip & install Python deps
COPY requirements.txt .
RUN python -m pip install --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Copy the entire application
COPY . .

# Create non-root user and set permissions
RUN adduser -u 5678 --disabled-password --gecos "" appuser && \
    chown -R appuser:appuser /app && \
    chmod -R 755 /app && \
    chmod -R 777 /app/app/static/profile_pictures

USER appuser

# Start the app
CMD ["gunicorn", "--bind", "0.0.0.0:5008", "run:app"]
