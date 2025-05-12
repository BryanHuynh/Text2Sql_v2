import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
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
    return fieldName;
  }, [fieldName]);

  useEffect(() => {
    onCallback(index, callback);
  }, [index, onCallback, callback]);

  return (
    <div className="flex items-center">
      <label className="sm:text-base font-medium text-white-900 mr-2">
        Field Name:
      </label>
      <input
        type="text"
        className="p-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-base flex-grow text-black"
        value={fieldName}
        onChange={(e) => setFieldName(e.target.value)}
      ></input>
      <button
        onClick={(e) => {
          e.preventDefault();
          onRemove(index);
        }}
      >
        <Image
          src="/cross.svg"
          className="dark:invert"
          alt="Add Icon"
          width={25}
          height={10}
        />
      </button>
    </div>
  );
};

export default FieldInput;
