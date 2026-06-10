FROM python:3.14-slim

WORKDIR /app

RUN apt-get update && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir trafilatura fastapi "uvicorn[standard]"

RUN useradd --no-create-home --shell /bin/false appuser

COPY --chown=appuser:appuser app.py .

USER appuser

EXPOSE 8081

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8081"]
