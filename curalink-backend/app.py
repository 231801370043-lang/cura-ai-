#!/usr/bin/env python3
"""
Simple FastAPI entry point for Render deployment
This file uses minimal dependencies to ensure compatibility
"""

import os
import sys
from typing import Dict, Any

# Simple FastAPI app without complex dependencies
try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
except ImportError as e:
    print(f"Import error: {e}")
    sys.exit(1)

# Create FastAPI app
app = FastAPI(
    title="CuraLink API",
    description="Healthcare Discovery Platform API",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root() -> Dict[str, Any]:
    """Root endpoint"""
    return {
        "message": "Welcome to CuraLink API",
        "version": "1.0.0",
        "status": "operational",
        "python_version": sys.version,
        "environment": "production"
    }

@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint"""
    return {"status": "healthy"}

@app.get("/api/test")
async def test_endpoint() -> Dict[str, Any]:
    """Test endpoint"""
    return {
        "message": "CuraLink API is working perfectly!",
        "status": "success",
        "timestamp": "2024-11-05T01:00:00Z"
    }

# Environment info endpoint
@app.get("/info")
async def info() -> Dict[str, Any]:
    """System information"""
    return {
        "python_version": sys.version,
        "platform": sys.platform,
        "environment_variables": {
            "PORT": os.getenv("PORT", "Not set"),
            "MONGODB_URL": "Set" if os.getenv("MONGODB_URL") else "Not set",
            "JWT_SECRET": "Set" if os.getenv("JWT_SECRET") else "Not set",
            "SAMBANOVA_API_KEY": "Set" if os.getenv("SAMBANOVA_API_KEY") else "Not set"
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
