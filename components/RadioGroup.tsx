import * as React from "react";
import { useFormContext } from "react-hook-form";

type InputProps = {
  name: string;
  label: string;
  options: string[];
  inline?: boolean;
};

const RadioGroup = ({ name, label, options, inline }: InputProps) => {
  const { register } = useFormContext();
  return (
    <div className={inline ? "flex gap-2 justify-between" : ""}>
      <label className="text-gray-500 font-bold">{label}</label>
      <br />
      <div className="mt-1 flex gap-2">
        {options.map((option) => (
          <React.Fragment key={option}>
            <label className="whitespace-nowrap">
              <input {...register(name)} type="radio" name={name} value={option} /> {option}
            </label>
            <br />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default RadioGroup;
