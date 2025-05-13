from flask import Flask, request, jsonify
from flask_cors import CORS
from model_query import query_model
import logging
import yaml
import os


app = Flask(__name__)
CORS(app)
config = yaml.safe_load(open("./config.yml"))
logger = logging.getLogger(__name__)
host = config['host']
port = config['port']

@app.route('/data', methods=['POST'])
def get_model_response():
    body = request.get_json()

    if body is None:
        logger.error(f"no body found in request")
        return jsonify({"error": "No Json body provided"}), 400
    
    if body.get('schema') is None:
        logger.error(f"no schema found in {body}")
        return jsonify({"error": "No schema provided"}), 400
    else:
        schema = body['schema']
    
    if body.get('question') is None:
        logger.error(f"no question found in {body}")
        return jsonify({"error": "No question provided"}), 400
    else:
        question = body['question']
    
    return jsonify({'response': query_model(schema, question)}, 200)
    # return jsonify('hello')

if __name__ == '__main__':
    print(config['logging_file'])
    log_file_path = config['logging_file']
    log_dir = os.path.dirname(log_file_path)
    if log_dir and not os.path.exists(log_dir): # Check if log_dir is not empty and if it exists
        os.makedirs(log_dir, exist_ok=True) # Create directory if it doesn't exist
    logging.basicConfig(
        filename=log_file_path, 
        level=logging.INFO,
        format='%(asctime)s %(levelname)s %(message)s',
        datefmt="%Y-%m-%d %H:%M:%S"
        )
    logger.info(f"started flash on host: {host}, port: {port}")
    app.run(host=host, port=port)