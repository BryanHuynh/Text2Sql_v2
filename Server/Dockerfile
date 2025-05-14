FROM python:3.10-slim

WORKDIR /app

COPY app.py .

COPY requirements.txt .

COPY fine_tuned_flan_t5_sql ./model

RUN pip install -r requirements.txt


RUN apt-get update && apt-get install -y unzip curl && \
    curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
    echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | tee /etc/apt/sources.list.d/ngrok.list && \
    apt-get update && apt-get install ngrok -y


EXPOSE 7860

CMD ["sh", "-c", "\
    python app.py & \
    ngrok config add-authtoken $NGROK_AUTHTOKEN && \
    ngrok http --url=$NGROK_URL 7860 \
"]