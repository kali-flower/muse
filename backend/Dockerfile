# use Python 3.10 as base image 
FROM python:3.10-slim

# working directory set in container 
WORKDIR /app

# copy current directory contents into container at /app
COPY . .

# install packages from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# expose port 5000 for Flask
EXPOSE 5000

# command to run Flask app
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
