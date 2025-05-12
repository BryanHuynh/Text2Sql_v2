"use client";
import { Key, useEffect, useRef, useState } from "react";
import FieldInput from "./FieldInput";
import Image from "next/image";

interface TableInputFormProps {
  id: Key;
  onRemoveTable: (id: Key) => void;
}

const TableInputForm: React.FC<TableInputFormProps> = ({ id, onRemoveTable }) => {
  const [tableName, setTableName] = useState<string>("");
  const [fieldInputs, setFieldInputs] = useState<number[]>([]);
  const callbackRefs = useRef<(() => void)[]>([]);
  const fieldInputCount = useRef(0);


  useEffect(() => {
    addFieldInput();
  }, []);
  
  const addFieldInput = () => {
    const index: number = fieldInputCount.current;
    setFieldInputs([...fieldInputs, index]);
    fieldInputCount.current++;
  };


  const registerCallback = (index: number, callback: () => string) => {
    callbackRefs.current[index] = callback;
  };

  const removeFieldInput = (index: number) => {
    setFieldInputs(fieldInputs.filter((i) => i !== index));
  };

  const logFields = () => {
    const results = callbackRefs.current.map((cb, i) => {
      if (typeof cb === "function" && fieldInputs.includes(i)) {
        return cb();
      }
      return null;
    });
    console.log(results);
    console.log(
      `TABLE ${tableName} (${results
        .filter((result) => result)
        .join(",")});`
    );
  };

  return (
    <form className="border-white border-2 p-3 space-y-3 rounded-md relative"> {/* Added rounded-md and relative */}
      <button
        type="button" // Important to prevent form submission
        onClick={() => onRemoveTable(id)}
        className="absolute top-1 right-1 text-white hover:text-red-400 p-1 rounded-full transition-colors"
        aria-label="Remove table"
      >
        <Image
          src="/cross.svg" // Assuming you have a cross icon, or use text
          className="dark:invert"
          alt="Remove Table Icon"
          width={16} // Adjusted size
          height={16}
        />
      </button>
      <div className="flex items-center mt-4"> {/* Added mt-4 to avoid overlap with remove button */}
        <label className="sm:text-base font-medium text-white mr-2"> {/* Changed text-white-900 to text-white */}
          Table Name:
        </label>
        <input
          type="text"
          className="p-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-base flex-grow text-black"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
        />
      </div>
      {fieldInputs.map((index) => (
        <FieldInput
          key={index}
          index={index}
          onCallback={registerCallback}
          onRemove={removeFieldInput}
        />
      ))}
      <div className="w-full bg-gray-500 rounded p-1 flex justify-center items-center hover:bg-gray-600 cursor-pointer" onClick={addFieldInput}> {/* Added cursor-pointer */}
        <Image
          src="/add.svg"
          className="dark:invert"
          alt="Add Icon"
          width={25}
          height={10}
        />
      </div>
      <button
        className="w-full bg-sky-600 hover:bg-sky-700 rounded p-1 text-white transition-colors" // Changed color for better distinction
        onClick={(e) => {
          e.preventDefault();
          logFields();
        }}
      >
        Submit
      </button>
    </form>
  );
};

export default TableInputForm;
