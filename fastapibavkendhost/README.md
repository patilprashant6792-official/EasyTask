# FastAPI Backend Host

A simple FastAPI application with basic endpoints.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

## Run the Application

```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Endpoints

- `GET /` - Root endpoint
- `GET /health` - Health check endpoint
- `GET /api/hello/{name}` - Returns a personalized greeting
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation

## Example Usage

```bash
# Check health
curl http://localhost:8000/health

# Get greeting
curl http://localhost:8000/api/hello/World
```

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
