from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import base_router

app = FastAPI(
    title="Device Pulse",
    description="Backend project for Device Pulse",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    author="Rachit",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(base_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app="main:app", host="0.0.0.0", port=settings.PORT, reload=True)