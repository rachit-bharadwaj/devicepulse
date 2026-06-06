from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import api_router
from app.database import engine
from app.database.models import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatically create tables in the database on startup
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Device Pulse",
    description="Backend project for Device Pulse",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    author="Rachit",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(api_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app="main:app", host="0.0.0.0", port=settings.PORT, reload=True)