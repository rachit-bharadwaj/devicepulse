import asyncio
from contextlib import asynccontextmanager
import random
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func

from app.config import settings
from app.routes import api_router
from app.database import engine, SessionLocal
from app.database.models import Base, Device, DeviceStatus
from app.utils.websocket import manager


# Simulation background task
async def simulate_device_health():
    while True:
        try:
            await asyncio.sleep(5)  # Simulates health check every 5 seconds
            db = SessionLocal()
            try:
                devices = db.query(Device).all()
                for device in devices:
                    # 20% chance to toggle the status
                    if random.random() < 0.2:
                        device.status = (
                            DeviceStatus.DOWN 
                            if device.status == DeviceStatus.UP 
                            else DeviceStatus.UP
                        )
                    device.last_checked = func.now()
                    db.add(device)
                    db.commit()
                    db.refresh(device)
                    
                    # Broadcast status update
                    await manager.broadcast({
                        "event": "device_updated",
                        "device": device
                    })
            except Exception as e:
                db.rollback()
                print(f"Database error in simulation: {e}")
            finally:
                db.close()
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"Unexpected error in simulation: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Automatically create tables in the database on startup
    Base.metadata.create_all(bind=engine)
    # Start simulation task
    sim_task = asyncio.create_task(simulate_device_health())
    yield
    # Cancel simulation task on shutdown
    sim_task.cancel()
    try:
        await sim_task
    except asyncio.CancelledError:
        pass


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


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We must read from the websocket to detect disconnection
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)


app.include_router(api_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app="main:app", host="0.0.0.0", port=settings.PORT, reload=True)