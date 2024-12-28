from transformers import T5Tokenizer, T5ForConditionalGeneration, T5Model
from transformers import Seq2SeqTrainer, Seq2SeqTrainingArguments, DataCollatorForSeq2Seq, Trainer
import torch.nn.functional as F
from torch.utils.data import DataLoader
from datasets import Dataset, DatasetDict
import torch
import json
from datasets import load_dataset
from pprint import pprint
device = 'cuda' if torch.cuda.is_available() else 'cpu'

print(device)

def load_data(filepath):
    with open(filepath) as json_file:
        return json.load(json_file)

train_data = load_data("./spider_data/train_spider.json")
train_tables_data = load_data("./spider_data/tables.json")

test_data = load_data("./spider_data/test.json")
test_tables_data = load_data("./spider_data/test_tables.json")


def generate_table_index(tables):
    index_dictionary = {}
    for index, table in enumerate(tables):
        index_dictionary[table['db_id']] = index
    return index_dictionary

train_table_index_dictionary = generate_table_index(train_tables_data)
test_table_index_dictionary = generate_table_index(test_tables_data)



def parse_table(db_id, tables, table_index_dictionary):
    table = tables[table_index_dictionary[db_id]]
    table_names = []
    column = {}
    # print(table['column_names_original'])
    for table_name in table['table_names_original']:
        table_names.append(table_name)
        column[table_name] = []
    for index, column_name in table['column_names_original']:
        if(index == -1): 
            continue
        column[table_names[index]].append(column_name)
    return column

def parse(entry, tables, table_index_dictionary):
    question = entry['question']
    target = entry['query']
    db_id = entry['db_id']
    schema = parse_table(db_id, tables, table_index_dictionary)
    # print(schema, question, target)
    return {'input': f"Given the following SQL Schema: {schema}. Provide a SQL query reponse for: {question}", 'target': target}

tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-small")

def preprocess_data(examples):
    inputs = [item for item in examples['input']]
    model_inputs = tokenizer(inputs, max_length=1024, truncation=True, padding=True, return_tensors="pt")
    
    targets = [item for item in examples['target']]
    with tokenizer.as_target_tokenizer():
        labels = tokenizer(targets, max_length=521, truncation=True, padding=True, return_tensors="pt")

    model_inputs["labels"] = labels["input_ids"]
    return model_inputs


raw_training_data = [parse(train_data[i], train_tables_data, train_table_index_dictionary) for i in range(len(train_data))]
raw_testing_data = [parse(test_data[i], test_tables_data, test_table_index_dictionary) for i in range(len(test_data))]
training_dataset = Dataset.from_list(raw_training_data)
testing_dataset = Dataset.from_list(raw_testing_data)
dataset_dict = DatasetDict({
    "train": training_dataset,
    "test": testing_dataset
})
encoded_dataset = dataset_dict.map(preprocess_data, batched=True)
encoded_dataset = encoded_dataset.remove_columns(['input', 'target'])


model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-small")
model.to(device)
data_collator = DataCollatorForSeq2Seq(tokenizer=tokenizer, model=model)
train_loader = DataLoader(encoded_dataset['train'], batch_size=8, shuffle=True, collate_fn=data_collator)
eval_loader = DataLoader(encoded_dataset['test'], batch_size=8, shuffle=True, collate_fn=data_collator)


# Define training arguments

# Define training arguments
training_args = Seq2SeqTrainingArguments(
    output_dir="./results",
    eval_strategy="steps",
    eval_steps=250,
    logging_steps=250,
    learning_rate=5e-5,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    save_total_limit=2,
    predict_with_generate=True,
    remove_unused_columns=True,
)

# Define trainer
trainer = Seq2SeqTrainer(
    model=model,
    args=training_args,
    train_dataset=encoded_dataset['train'],
    eval_dataset=encoded_dataset['test'],
    processing_class=tokenizer,
    data_collator=data_collator
)


# # Train the model
trainer.train()

# Save the model
model.save_pretrained("./fine_tuned_t5_sql")
tokenizer.save_pretrained("./fine_tuned_t5_sql")