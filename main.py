# main.py

from fastapi import FastAPI

# Create FastAPI app instance
app = FastAPI()

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Vida Coach API is up and running!"}