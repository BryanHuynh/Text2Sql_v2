import datetime
import os
from transformers import T5Tokenizer, T5ForConditionalGeneration, T5Model
from transformers import Seq2SeqTrainer, Seq2SeqTrainingArguments, DataCollatorForSeq2Seq, Trainer
import torch.nn.functional as F
from torch.utils.data import DataLoader
from datasets import Dataset, DatasetDict
import torch
import json
import yaml
from datasets import load_dataset
from pprint import pprint
import random
import matplotlib.pyplot as plt

device = 'cuda' if torch.cuda.is_available() else 'cpu'
config = yaml.safe_load(open("./config.yml"))

print(device)
torch.cuda.empty_cache()
if device == 'cuda':
    torch.backends.cudnn.benchmark = True

def load_data(filepath):
    with open(filepath) as json_file:
        return json.load(json_file)

dataset_1 = load_data(config['spider_training_dataset'])
dataset_1_tables = load_data(config['spider_training_tables_dataset'])


dataset_2 = load_data(config['spider_validation_dataset'])
dataset_2_tables = load_data(config['spider_validation_tables_dataset'])

dataset_3 = load_data(config['spider_test_dataset'])
dataset_3_tables = load_data(config['spider_test_tables_dataset'])

dataset = dataset_1 + dataset_2 + dataset_3
tables_dataset = dataset_1_tables + dataset_2_tables + dataset_3_tables

def generate_table_index(tables):
    index_dictionary = {}
    for index, table in enumerate(tables):
        index_dictionary[table['db_id']] = index
    return index_dictionary

dataset_index_dictionary = generate_table_index(tables_dataset)

def splitData(_dataset, training=0.7, validation=0.2, testing=0.1):
    if(training + validation + testing > 1.0):
        return ValueError('training, validation and testing sum > 1.0')
    random.shuffle(_dataset)
    training_dataset = []
    validation_dataset = []
    testing_dataset = []
    dataset_size = len(_dataset)
    for i in range(dataset_size):
        if i < training * float(dataset_size):
            training_dataset.append(_dataset[i])
        elif i < (training + validation) * float(dataset_size):
            validation_dataset.append(_dataset[i])
        else:
            testing_dataset.append(_dataset[i])
    return training_dataset, validation_dataset, testing_dataset

train_data, validation_data, test_data = splitData(dataset)
            

def parse_table(db_id, tables, table_index_dictionary):
    table = tables[table_index_dictionary[db_id]]       
    table_names = []
    column = {}
    ret_string = ""
    # print(table['column_names_original'])
    for table_name in table['table_names_original']:
        table_names.append(table_name)
        column[table_name] = []
    for index, column_name in table['column_names_original']:
        if(index == -1): 
            continue
        column[table_names[index]].append(column_name)
    for table in column:
        ret_string += f"TABLE {table} ("
        ret_string += ' ,'.join(column[table])
        ret_string += '); '
        # remove spaces and replace with underscore for fields
    return ret_string

def parse(entry, tables, table_index_dictionary):
    question = entry['question']
    target = entry['query']
    db_id = entry['db_id']
    schema = parse_table(db_id, tables, table_index_dictionary)
    # print(schema, question, target)
    return {'input': f"Given the following SQL Schema: {schema}. Provide a SQL query reponse for: {question}", 'target': target}

tokenizer = T5Tokenizer.from_pretrained(config['pretrained_source_model'])

def preprocess_data(examples):
    inputs = [item for item in examples['input']]
    
    model_inputs = tokenizer(inputs, max_length=1024, truncation=True, padding=True, return_tensors="pt")
    
    targets = [item for item in examples['target']]
    with tokenizer.as_target_tokenizer():
        labels = tokenizer(targets, max_length=300, truncation=True, padding=True, return_tensors="pt")

    model_inputs["labels"] = labels["input_ids"]
    return model_inputs

raw_training_data = [parse(train_data[i], tables_dataset, dataset_index_dictionary) for i in range(len(train_data))]
raw_validationing_data = [parse(validation_data[i], tables_dataset, dataset_index_dictionary) for i in range(len(validation_data))]
raw_testing_data = [parse(test_data[i], tables_dataset, dataset_index_dictionary) for i in range(len(test_data))]

training_dataset = Dataset.from_list(raw_training_data)
validationing_dataset = Dataset.from_list(raw_validationing_data)
testing_dataset = Dataset.from_list(raw_testing_data)

dataset_dict = DatasetDict({
    "train": training_dataset,
    "validation": validationing_dataset,
    "test": testing_dataset
})
encoded_dataset = dataset_dict.map(preprocess_data, batched=True)
encoded_dataset = encoded_dataset.remove_columns(['input', 'target'])


model = T5ForConditionalGeneration.from_pretrained(config['pretrained_source_model'])
model.to(device)
data_collator = DataCollatorForSeq2Seq(tokenizer=tokenizer, model=model)

# Define training arguments

# Define training arguments
training_args = Seq2SeqTrainingArguments(
    output_dir="./results",
    eval_strategy="steps",
    eval_steps=config['evaluation_steps'],
    logging_steps=config['logging_steps'],
    learning_rate=3e-5,
    per_device_train_batch_size=config['batch_size'],
    per_device_eval_batch_size=config['batch_size'],
    save_total_limit=2,
    predict_with_generate=True,
    remove_unused_columns=True,
    gradient_accumulation_steps=config.get('gradient_accumulation_steps', 1),
    gradient_checkpointing=config.get('gradient_checkpointing', False)
)

# Define trainer
trainer = Seq2SeqTrainer(
    model=model,
    args=training_args,
    train_dataset=encoded_dataset['train'],
    eval_dataset=encoded_dataset['validation'],
    tokenizer=tokenizer,
    data_collator=data_collator
)


# Train the model
trainer.train()
test_output = trainer.evaluate(encoded_dataset['test'])
print(test_output)

# Save the model
model.save_pretrained(config['model_save_location'])
tokenizer.save_pretrained(config['model_save_location'])

train_steps = []
train_losses = []
eval_steps = []
eval_losses = []

log_history = trainer.state.log_history
for log_entry in log_history:
    if 'loss' in log_entry: # Training loss
        train_steps.append(log_entry['step'])
        train_losses.append(log_entry['loss'])
    if 'eval_loss' in log_entry: # Evaluation loss
        eval_steps.append(log_entry['step'])
        eval_losses.append(log_entry['eval_loss'])

plt.figure(figsize=(10, 5))
if train_steps and train_losses:
    plt.plot(train_steps, train_losses, label='Training Loss', marker='o', linestyle='-')
if eval_steps and eval_losses:
    plt.plot(eval_steps, eval_losses, label='Evaluation Loss', marker='x', linestyle='--')

batch_size_info = training_args.per_device_train_batch_size * training_args.gradient_accumulation_steps
learning_rate_info = training_args.learning_rate
plt.title(f'Training & Eval Loss\nBatch Size (Effective): {batch_size_info}, LR: {learning_rate_info:.0e}')
plt.xlabel('Steps')
plt.ylabel('Loss')
plt.ylim(bottom=0, top=1.0) # Clip y-axis: show 0 to 1.0
plt.legend()
plt.grid(True)

plot_path = os.path.join(training_args.output_dir, f"loss_plot_{datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.png")
plt.savefig(plot_path)
print(f"Loss plot saved to {plot_path}")