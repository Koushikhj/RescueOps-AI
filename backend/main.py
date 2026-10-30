from fastapi import FastAPI

app = FastAPI(
    title="RescueOps AI",
    description="Multi-Agent Emergency Response Coordinator",
    version="1.0.0"
)


@app.get("/")
def home():
    return {
        "project": "RescueOps AI",
        "message": "Welcome to RescueOps AI Backend",
        "status": "Running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RescueOps AI Backend"
    }