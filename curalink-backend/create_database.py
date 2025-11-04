#!/usr/bin/env python3
"""
Automatic Database Creation Script for CuraLink
This script will create the database automatically before starting the application
"""

import pymysql
import sys
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

def create_database():
    """Create the CuraLink database if it doesn't exist"""
    
    print("🔧 Creating CuraLink database...")
    
    try:
        # Connect to MySQL without specifying a database
        connection = pymysql.connect(
            host='localhost',
            user='root',
            password='Karthik@2004',
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        with connection.cursor() as cursor:
            # Create database
            cursor.execute(
                "CREATE DATABASE IF NOT EXISTS curalink CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
            print("✅ Database 'curalink' created successfully!")
            
            # Use the database
            cursor.execute("USE curalink")
            print("✅ Using database 'curalink'")
            
            # Show success message
            cursor.execute("SELECT 'Database is ready!' AS status")
            result = cursor.fetchone()
            print(f"✅ {result['status']}")
        
        connection.commit()
        connection.close()
        
        print("\n🎉 Database setup complete!")
        print("📊 The FastAPI application will now create all tables automatically.")
        print("\n🚀 You can now start the backend with: python main.py")
        return True
        
    except pymysql.Error as e:
        print(f"❌ Error creating database: {e}")
        print("\n💡 Please check:")
        print("   - MySQL is running")
        print("   - Password is correct: Karthik@2004")
        print("   - Root user has CREATE DATABASE privileges")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = create_database()
    sys.exit(0 if success else 1)
