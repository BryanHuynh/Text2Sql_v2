from transformers import T5Tokenizer, T5ForConditionalGeneration
import yaml
import logging

config = yaml.safe_load(open("./config.yml"))
logger = logging.getLogger(__name__)

def query_model(schema, question):
    model = T5ForConditionalGeneration.from_pretrained(config['fine_tuned_model_directory'])  # Path to your saved model
    tokenizer = T5Tokenizer.from_pretrained(config['fine_tuned_model_directory'])
    return _query_model(model, tokenizer, schema, question)

def _query_model(model, tokenizer, schema, question):
    sample_input =  f"Given the following SQL Schema: {schema}. Provide a SQL query reponse for: {question}"

    input_ids = tokenizer.encode(
        sample_input,
        max_length=1024,           # Ensure this matches the training max_length
        truncation=True,          # Truncate input if it's too long
        return_tensors="pt"       # Return as PyTorch tensors
    )

    model.eval()  # Set model to evaluation mode
    output_ids = model.generate(
        input_ids,
        max_length=300,           # Set max_length for the output
        num_beams=5,              # Beam search for better results (can adjust as needed)
        temperature=1.0,          # Adjust temperature for randomness in output
        repetition_penalty=2.5,   # Penalize repetition
        early_stopping=True       # Stop early if the output sequence is complete
    )
    output_text = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    logger.info(f"model query for schema {schema}, question {question}, response {output_text}")
    return output_text
    