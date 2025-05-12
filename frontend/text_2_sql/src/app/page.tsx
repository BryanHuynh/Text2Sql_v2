"use client"; // Required for useState
import { useState, Key } from "react"; // Import useState and Key
import QuestionField from "@/components/questionField/QuestionField";
import TableInputForm from "@/components/TableInputForm/TableInputForm";
import { Field, Label } from "@headlessui/react";

export default function Home() {
  // State to manage the list of table forms. Each item can be a unique key.
  const [tableForms, setTableForms] = useState<Key[]>([0]); // Start with one table form
  const [nextTableKey, setNextTableKey] = useState(1); // Counter for unique keys

  const handleAddNewTable = () => {
    setTableForms((prevForms) => [...prevForms, nextTableKey]);
    setNextTableKey((prevKey) => prevKey + 1);
  };

  const handleRemoveTable = (tableKeyToRemove: Key) => {
    setTableForms((prevForms) => prevForms.filter(key => key !== tableKeyToRemove));
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center w-full  ">
        <div className="flex w-full flex-wrap gap-4 justify-center items-start"> {/* Changed items-baseline to items-start for better alignment of multiple forms */}
          {tableForms.map((key) => (
            <TableInputForm key={key} id={key} onRemoveTable={handleRemoveTable} />
          ))}
          <Field className="self-center"> {/* Aligns the "Add Table" button nicely */}
            <Label
              className="flex flex-col items-center text-sm font-medium text-white cursor-pointer hover:text-sky-400 transition-colors" // Added cursor, hover effect, and transition
              onClick={handleAddNewTable} // Attach the click handler
            >
              {'A D D T A B L E'.split(' ').map((letter, index) => (
                <span key={index}>{letter}</span>
              ))}
            </Label>
          </Field>
        </div>
        <div className="flex flex-row items-center justify-baseline gap-2 max-w-xl">
          <QuestionField />
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}
