# Use official Python base image
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Copy requirements file first (for Docker caching efficiency)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire project into container
COPY . .

# Expose port FastAPI will run on
EXPOSE 8000

# Run the FastAPI app using uvicorn
# The --reload flag is helpful during development because it watches for code
# changes and automatically restarts the server. Remove this flag in production
# images to avoid the overhead of file watching.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]