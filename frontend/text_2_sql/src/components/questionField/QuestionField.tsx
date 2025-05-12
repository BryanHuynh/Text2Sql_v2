import { Button, Field, Textarea } from "@headlessui/react";
import { useState } from "react";
interface QuestionFieldProps {
  onAskPressed: (question: string) => void;
}

const QuestionField: React.FC<QuestionFieldProps> = ({ onAskPressed }) => {
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onButtonPress = () => {
    if (question.trim() === "") {
      setError("Question cannot be empty.");
      return;
    }
    setError(null); // Clear any previous error
    onAskPressed(question);
  };

  return (
    <Field className="flex flex-col gap-2 max-w-xl w-screen">
      <label
        htmlFor="question-input"
        className="text-sm font-medium text-white"
      >
        Ask a question:
      </label>
      <div className="flex flex-row gap-1 items-center justify-center">
        {/* <input
          type="text"
          id="question-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          name="question"
          className={`px-2 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-base w-full text-black ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          aria-invalid={!!error}
          aria-describedby={error ? "question-error" : undefined}
        /> */}
        <Textarea
          name="description"
          className={`px-2 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-base w-full text-black ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          onChange={(e) => setQuestion(e.target.value)}
          value={question}
        />

        <Button
          className="rounded bg-gray-700 py-2 text-sm text-white data-active:bg-sky-700 data-hover:bg-sky-500 h-full flex-grow"
          onClick={onButtonPress}
        >
          Generate Query
        </Button>
      </div>
      {error && (
        <p id="question-error" className="text-sm text-red-500 mt-1">
          {error}
        </p>
      )}
    </Field>
  );
};

export default QuestionField;
