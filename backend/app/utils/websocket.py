from fastapi import WebSocket
from fastapi.encoders import jsonable_encoder

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        # Iterate over a copy of the list because connections might be removed during iteration
        for connection in list(self.active_connections):
            try:
                await connection.send_json(jsonable_encoder(message))
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()
