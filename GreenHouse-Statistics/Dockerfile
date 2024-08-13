# Use Python 3.11 for the API
FROM python:3.11

# Set working directory
WORKDIR /app

# Copy requirements.txt
COPY requirements.txt ./

# Install dependencies
RUN pip install -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the API port
EXPOSE 5000

# Run the Flask API
CMD ["python", "api/statistic_api.py"]
