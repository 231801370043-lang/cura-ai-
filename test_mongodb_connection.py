#!/usr/bin/env python3
"""
MongoDB Connection Test for CuraLink
Tests the connection to MongoDB Atlas with your actual credentials
"""

import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'curalink-backend'))

try:
    from pymongo.mongo_client import MongoClient
    from pymongo.server_api import ServerApi
    print("✅ PyMongo imported successfully")
except ImportError:
    print("❌ PyMongo not found. Installing...")
    os.system("python -m pip install 'pymongo[srv]'")
    from pymongo.mongo_client import MongoClient
    from pymongo.server_api import ServerApi
    print("✅ PyMongo installed and imported")

# Your actual MongoDB connection string
uri = "mongodb+srv://231801370043_db_user:karthikpaila@curalink-cluster.4ybg0bm.mongodb.net/curalink?retryWrites=true&w=majority&appName=curalink-cluster"

print("🔗 Connecting to MongoDB Atlas...")
print(f"📍 Cluster: curalink-cluster.4ybg0bm.mongodb.net")
print(f"👤 User: 231801370043_db_user")
print(f"🗄️ Database: curalink")

# Create a new client and connect to the server
try:
    client = MongoClient(uri, server_api=ServerApi('1'))
    
    # Send a ping to confirm a successful connection
    client.admin.command('ping')
    print("🎉 SUCCESS: Pinged your deployment. You successfully connected to MongoDB!")
    
    # Test database access
    db = client.curalink
    print(f"✅ Database 'curalink' accessible")
    
    # List collections (will be empty initially)
    collections = db.list_collection_names()
    print(f"📋 Collections in database: {collections if collections else 'None (database is empty - this is normal for new setup)'}")
    
    # Test creating a test document
    test_collection = db.test_connection
    test_doc = {"message": "CuraLink connection test", "status": "success"}
    result = test_collection.insert_one(test_doc)
    print(f"✅ Test document inserted with ID: {result.inserted_id}")
    
    # Clean up test document
    test_collection.delete_one({"_id": result.inserted_id})
    print("🧹 Test document cleaned up")
    
    print("\n🚀 MongoDB Atlas is ready for CuraLink deployment!")
    print("✅ Connection string is working perfectly")
    print("✅ Database operations are functional")
    print("✅ Ready for Render deployment")
    
except Exception as e:
    print(f"❌ ERROR: {e}")
    print("\n🔧 Troubleshooting:")
    print("1. Check if your IP address is whitelisted in MongoDB Atlas")
    print("2. Verify the username and password are correct")
    print("3. Ensure network access allows connections from anywhere (0.0.0.0/0)")
    
finally:
    try:
        client.close()
        print("🔒 Connection closed")
    except:
        pass
