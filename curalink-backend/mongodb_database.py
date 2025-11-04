import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/curalink")

class Database:
    client: AsyncIOMotorClient = None
    database = None

db = Database()

async def connect_to_mongo():
    """Create database connection"""
    db.client = AsyncIOMotorClient(MONGODB_URL)
    db.database = db.client.get_default_database()
    
    # Import models here to avoid circular imports
    from mongodb_models import User, Trial, Publication, Expert, Forum, ForumPost, Favorite, ChatMessage, Meeting, Notification
    
    # Initialize beanie with the models
    await init_beanie(
        database=db.database,
        document_models=[
            User, Trial, Publication, Expert, Forum, ForumPost, 
            Favorite, ChatMessage, Meeting, Notification
        ]
    )
    print("✅ Connected to MongoDB")

async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()
        print("👋 Disconnected from MongoDB")

async def get_database():
    """Get database instance"""
    return db.database
