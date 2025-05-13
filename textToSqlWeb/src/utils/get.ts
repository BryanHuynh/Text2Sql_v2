import axios from "axios";

export async function getAnswerBasedOnSchemaAndQuestion(
  question: string,
  schema: string
) {
  const body = {
    question: question,
    schema: schema,
  };
  console.log(body);
  const response = await axios.post('/data', body, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data[0].response;
}
