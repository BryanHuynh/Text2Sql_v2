import { Client } from "@gradio/client";

export async function getAnswerBasedOnSchemaAndQuestion(
  question: string,
  schema: string
): Promise<string> {
  const client = await Client.connect(
    "https://positive-curiously-rattler.ngrok-free.app/"
  );
  const result = await client.predict("/predict", {
    schema: schema,
    question: question,
  });

  return result.data as string;
}
