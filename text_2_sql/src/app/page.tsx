"use client"; // Required for useState
import { useState, Key, useRef } from "react"; // Import useState and Key
import QuestionField from "@/components/questionField/QuestionField";
import TableInputForm from "@/components/TableInputForm/TableInputForm";
import { Field, Label } from "@headlessui/react";

export default function Home() {
  // State to manage the list of table forms. Each item can be a unique key.
  const [tableForms, setTableForms] = useState<Key[]>([0]); // Start with one table form
  const [nextTableKey, setNextTableKey] = useState(1); // Counter for unique keys
  const callbackRefs = useRef<(() => string)[]>([]);

  const handleAddNewTable = () => {
    setTableForms((prevForms) => [...prevForms, nextTableKey]);
    setNextTableKey((prevKey) => prevKey + 1);
  };

  const handleRemoveTable = (tableKeyToRemove: Key) => {
    setTableForms((prevForms) =>
      prevForms.filter((key) => key !== tableKeyToRemove)
    );
    delete callbackRefs.current[tableKeyToRemove as number];
  };

  const registerCallback = (index: number, callback: () => string) => {
    callbackRefs.current[index] = callback;
  };

  const getTableDetails = (question: string) => {
    const results = callbackRefs.current.map((cb, i) => {
      if (typeof cb === "function" && tableForms.includes(i)) {
        return cb();
      }
      return null;
    });
    console.log(question);
    console.log(results);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center w-full ">
        <div className="flex w-full flex-wrap gap-4 justify-center items-center">
          {tableForms.map((key) => (
            <TableInputForm
              key={key}
              id={key}
              onRemoveTable={handleRemoveTable}
              onRequestTable={registerCallback}
            />
          ))}
          <div className="bg-gray-700 w-32 h-32 rounded-full flex items-center justify-center">
            <Field className="self-center">
              <Label
                className="flex items-center justify-center text-sm font-medium text-white cursor-pointer hover:text-sky-400 transition-colors" // Ensures text is centered in the label
                onClick={handleAddNewTable}
              >
                Add Table
              </Label>
            </Field>
          </div>
        </div>
        <div className="flex flex-row items-center justify-baseline gap-2 max-w-xl">
          <QuestionField onAskPressed={getTableDetails} />
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}
