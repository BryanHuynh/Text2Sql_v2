import React, { useEffect, useState, useCallback } from "react";
import { Field } from "@headlessui/react";
interface FieldInputProps {
  index: number;

  onCallback: (index: number, callback: () => string) => void;
  onRemove: (index: number) => void;
}

const FieldInput: React.FC<FieldInputProps> = ({
  index,
  onCallback,
  onRemove,
}) => {
  const [fieldName, setFieldName] = useState<string>("");

  const callback = useCallback((): string => {
    return fieldName.toLowerCase();
  }, [fieldName]);

  const updateFieldName = (text: string) => {
    let value: string = text;
    value = value.replace(/[^A-Za-z0-9_]/g, "");
    setFieldName(value);
  };


  useEffect(() => {
    onCallback(index, callback);
  }, [index, onCallback, callback]);

  return (
    <Field className="flex flex-row items-center">
      <label className="sm:text-base font-medium text-white-900 mr-2">
        Field Name:
      </label>
      <input
        type="text"
        className="p-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-base flex-grow text-black"
        value={fieldName}
        onChange={(e) => updateFieldName(e.target.value)}
      ></input>
      <button
        onClick={(e) => {
          e.preventDefault();
          onRemove(index);
        }}
      >
        <img
          src="/public/cross.svg"
          className="dark:invert fill-current text-red-400"
          alt="Add Icon"
          color="red"
          width={20}
          height={10}
        />
      </button>
    </Field>
  );
};

export default FieldInput;
