FROM python:3.9-slim-buster

WORKDIR /app

COPY . /app

COPY ./api/requirements.txt /app
COPY ./api/app.py /app

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 3001

CMD ["python", "app.py"]
