FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY archive.py normalize.py portal.py writer.py scrape.py ./

# Cloud Run sets PORT; we don't use it (this is a job, not a server).
# Cloud Scheduler invokes the container via HTTP POST to /; handle it minimally.
ENV PYTHONUNBUFFERED=1

# ENTRYPOINT is the fixed executable; CMD provides default args that --args overrides.
ENTRYPOINT ["python3", "scrape.py"]
CMD ["--mode", "weekly"]
