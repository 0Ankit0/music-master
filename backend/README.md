
# Backend API

A FastAPI-based backend service for the music application.

## Prerequisites

- Python 3.13+
- uv

## Installation

```bash
uv sync
```

## Running the Server

```bash
uv run uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## Optional Dependencies

Enable Demucs support:

```bash
uv sync --extra ml
```

Install development/test tooling:

```bash
uv sync --extra dev
```

## Task Commands

After installing `dev` dependencies, run:

```bash
uv run task dev
uv run task test
uv run task test_verbose
```

## API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── pyproject.toml   # Project metadata and dependencies
├── app/             # FastAPI app package
└── README.md        # This file
```

## Configuration

Set up environment variables as needed in a `.env` file.

## Contributing

Please follow PEP 8 style guidelines and add tests for new features.
