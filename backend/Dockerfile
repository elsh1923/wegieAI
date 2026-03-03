# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
# ffmpeg: for video processing
# imagemagick: for MoviePy text rendering
# fonts-noto-core: for Amharic font support (Noto Sans Ethiopic)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    imagemagick \
    fonts-noto-core \
    && rm -rf /var/lib/apt/lists/*

# Fix ImageMagick policy to allow MoviePy to use it
# By default, ImageMagick blocks certain operations for security.
RUN sed -i 's/domain="path" rights="none" pattern="@\*"/domain="path" rights="read|write" pattern="@\*"/g' /etc/ImageMagick-6/policy.xml

# Copy the requirements file into the container
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads audio captions output

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Run the application
CMD ["gunicorn", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "main:app", "--bind", "0.0.0.0:8000"]
