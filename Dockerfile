from docker.io/python:3.10.8-slim-bullseye as base

from base as locking
run \
        pip install poetry

from locking as dev
copy pyproject.toml poetry.lock /app
run \
        cd app && \
        poetry config virtualenvs.create false && \
        poetry install
