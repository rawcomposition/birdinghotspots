import React from "react";
import { useFormContext } from "react-hook-form";
import Help from "components/Help";

type InputProps = {
  name: string;
  label: string;
  options: string[] | { label: string; value: string }[];
  inline?: boolean;
  help?: string;
};

const RadioGroup = ({ name, label, options, inline, help }: InputProps) => {
  const { register } = useFormContext();
  return (
    <div className={inline ? "flex gap-2 justify-between" : ""}>
      <div>
        <label className="text-gray-500 font-bold">{label}</label>
        {help && <Help text={help} heading={label} />}
      </div>
      <div className="mt-1 flex gap-2">
        {options.map((option) =>
          typeof option === "string" ? (
            <React.Fragment key={option}>
              <label className="whitespace-nowrap">
                <input {...register(name)} type="radio" name={name} value={option} /> {option}
              </label>
              <br />
            </React.Fragment>
          ) : (
            <React.Fragment key={option.value}>
              <label className="whitespace-nowrap">
                <input {...register(name)} type="radio" name={name} value={option.value} /> {option.label}
              </label>
              <br />
            </React.Fragment>
          )
        )}
      </div>
    </div>
  );
};

export default RadioGroup;
