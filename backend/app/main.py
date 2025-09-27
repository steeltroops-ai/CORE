import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes import router

# Load environment variables from .env file
load_dotenv()


def create_app() -> FastAPI:
    app = FastAPI(title="CORE Backend", version="0.1.0")
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3001", 
            "http://localhost:3000",
            "https://core-five-phi.vercel.app/",  # Replace with your actual Vercel URL
            "https://*.vercel.app",  # Allow all Vercel preview deployments
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.include_router(router)
    return app


app = create_app()
