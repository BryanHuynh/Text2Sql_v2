import { Client } from "@gradio/client";

export async function getAnswerBasedOnSchemaAndQuestion(
  question: string,
  schema: string
) {
  const client = await Client.connect(
    "https://positive-curiously-rattler.ngrok-free.app/"
  );
  const result = await client.predict("/predict", {
    schema: schema,
    question: question,
  });

  console.log(result.data);

  return result.data;
}
