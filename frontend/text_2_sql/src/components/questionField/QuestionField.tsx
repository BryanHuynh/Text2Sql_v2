import { Button } from "@headlessui/react";
interface QuestionFieldProps {
  onAskPressed: () => void;
}

const QuestionField: React.FC<QuestionFieldProps> = ({ onAskPressed }) => {
  return (
    <div className="flex flex-col gap-2 max-w-xl w-screen">
      <label
        htmlFor="question-input"
        className="text-sm font-medium text-white"
      >
        Ask a question:
      </label>
      <div className="flex flex-row gap-1 items-center justify-center">
        <input
          type="text"
          id="question-input"
          name="question"
          className="px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-base w-full text-black"
        />
        <Button
          className="rounded bg-gray-700 px-6 py-2 text-sm text-white data-active:bg-sky-700 data-hover:bg-sky-500 h-full"
          onClick={onAskPressed}
        >
          Ask
        </Button>
      </div>
    </div>
  );
};

export default QuestionField;
