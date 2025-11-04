from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import json

from mongodb_database import connect_to_mongo, close_mongo_connection
from mongodb_routers import auth, users, trials, publications, experts, forums, favorites, chat, meetings, notifications

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 CuraLink Backend Starting with MongoDB...")
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()
    print("👋 CuraLink Backend Shutting Down...")

app = FastAPI(
    title="CuraLink API",
    description="AI-Powered Healthcare Discovery Platform with MongoDB",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.onrender.com",
        "https://curalink-frontend.onrender.com",
        "https://curalink-frontend-*.onrender.com",
        "*"  # Allow all origins for now
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(trials.router, prefix="/api/trials", tags=["Clinical Trials"])
app.include_router(publications.router, prefix="/api/publications", tags=["Publications"])
app.include_router(experts.router, prefix="/api/experts", tags=["Experts"])
app.include_router(forums.router, prefix="/api/forums", tags=["Forums"])
app.include_router(favorites.router, prefix="/api/favorites", tags=["Favorites"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(meetings.router, prefix="/api/meetings", tags=["Meetings"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to CuraLink API with MongoDB",
        "version": "1.0.0",
        "status": "operational",
        "database": "MongoDB"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "MongoDB"}

# Test MongoDB endpoint
@app.get("/test-db")
async def test_database():
    try:
        from mongodb_database import get_database
        db = await get_database()
        # Test connection by listing collections
        collections = await db.list_collection_names()
        return {
            "status": "MongoDB connection successful",
            "collections": collections
        }
    except Exception as e:
        return {
            "status": "MongoDB connection failed",
            "error": str(e)
        }

# WebSocket endpoint for real-time updates
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Handle different message types
            if message_data.get("type") == "chat":
                await manager.send_personal_message(
                    message_data.get("to_user_id"),
                    json.dumps({
                        "type": "chat",
                        "from": user_id,
                        "message": message_data.get("message"),
                        "timestamp": message_data.get("timestamp")
                    })
                )
            elif message_data.get("type") == "notification":
                await manager.send_personal_message(
                    message_data.get("to_user_id"),
                    json.dumps({
                        "type": "notification",
                        "message": message_data.get("message"),
                        "timestamp": message_data.get("timestamp")
                    })
                )
    except WebSocketDisconnect:
        manager.disconnect(user_id)

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main_mongodb:app", host="0.0.0.0", port=port, reload=False)
