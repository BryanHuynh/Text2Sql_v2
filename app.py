from flask import Flask, request, jsonify
from model_query import query_model
import logging
import yaml


app = Flask(__name__)
config = yaml.safe_load(open("./config.yml"))
logger = logging.getLogger(__name__)

@app.route('/data', methods=['GET'])
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
    logging.basicConfig(
        filename=config['logging_file'], 
        level=logging.INFO,
        format='%(asctime)s %(levelname)s %(message)s',
        datefmt="%Y-%m-%d %H:%M:%S"
        )
    logger.info("started")
    app.run()