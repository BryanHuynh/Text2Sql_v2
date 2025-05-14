"use client";
import { type Key, useCallback, useEffect, useRef, useState } from "react";
import FieldInput from "./FieldInput";
import { Field, Fieldset, Legend } from "@headlessui/react";

interface TableInputFormProps {
  id: Key;
  onRemoveTable: (id: Key) => void;
  onRequestTable: (index: number, callback: () => string) => void;
  uploadTableFormProps?: UploadTableFormProps;
}

interface UploadTableFormProps {
  title?: string;
  fieldNames?: string[];
}

const TableInputForm: React.FC<TableInputFormProps> = ({
  id,
  onRemoveTable,
  onRequestTable,
  uploadTableFormProps,
}) => {
  const [tableName, setTableName] = useState<string>("");
  const [fieldInputs, setFieldInputs] = useState<number[]>([]);
  const callbackRefs = useRef<(() => string)[]>([]);
  const fieldInputCount = useRef(0);

  useEffect(() => {
    addFieldInput();
    if (uploadTableFormProps) {
      if (uploadTableFormProps.title) {
        setTableName(uploadTableFormProps.title);
      }
      if (uploadTableFormProps.fieldNames) {
        uploadTableFormProps.fieldNames.forEach(() => {
          addFieldInput();
        });
      }
    }
  }, []);

  useEffect(() => {
    onRequestTable(id as number, getFields);
  }, [id, onRequestTable, tableName]);

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

  const getFields = useCallback((): string => {
    const results = callbackRefs.current.map((cb) => {
      if (typeof cb === "function") {
        return cb();
      }
      return null;
    });
    return `TABLE ${tableName.toLowerCase()} (${results
      .filter((result) => result)
      .join(",")});`;
  }, [tableName]);

  const updateTableName = (text: string) => {
    let value: string = text;
    value = value.replace(/[^A-Za-z0-9_]/g, "");
    setTableName(value);
  };

  return (
    <Fieldset className="border-white border-2 p-3 space-y-3 rounded-md relative">
      <Legend className="text-lg font-bold">Database Table {id}</Legend>
      <button
        type="button" // Important to prevent form submission
        onClick={() => onRemoveTable(id)}
        className="absolute top-1 right-1 text-white hover:text-red-400 p-1 rounded-full transition-colors"
        aria-label="Remove table"
      >
        <img
          src="/cross.svg" // Assuming you have a cross icon, or use text
          className="dark:invert "
          alt="Remove Table Icon"
          width={16} // Adjusted size
          height={16}
        />
      </button>
      <div className="flex items-center mt-4">
        <Field>
          <label className="sm:text-base font-medium text-white mr-2">
            Table Name:
          </label>
          <input
            type="text"
            className="p-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-base flex-grow text-black"
            value={tableName}
            onChange={(e) => updateTableName(e.target.value)}
          />
        </Field>
      </div>
      {fieldInputs.map((index) => (
        <FieldInput
          key={index}
          index={index}
          onCallback={registerCallback}
          onRemove={removeFieldInput}
        />
      ))}
      <div
        className="w-full bg-gray-500 rounded p-1 flex justify-center items-center hover:bg-gray-600 cursor-pointer"
        onClick={addFieldInput}
      >
        {" "}
        {/* Added cursor-pointer */}
        <img
          src="/add.svg"
          className="dark:invert"
          alt="Add Icon"
          width={25}
          height={10} 
        />
      </div>
      {/* <button
        className="w-full bg-sky-600 hover:bg-sky-700 rounded p-1 text-white transition-colors" // Changed color for better distinction
        onClick={(e) => {
          e.preventDefault();
          getFields();
        }}
      >
        Submit
      </button> */}
    </Fieldset>
  );
};

export default TableInputForm;
