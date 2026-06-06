from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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


@app.get("/")
def read_root():
    return {"message": "Welcome to Device Pulse API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app= "main:app", host="0.0.0.0", port=8000, reload=True)