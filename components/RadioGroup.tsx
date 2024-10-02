import React from "react";
import { useFormContext } from "react-hook-form";
import Help from "components/Help";

type InputProps = {
  name: string;
  label: string;
  options: string[] | { label: string; value: string }[];
  inline?: boolean;
  help?: string;
  onChange?: (value: string) => void;
};

const RadioGroup = ({ name, label, options, inline, help, onChange }: InputProps) => {
  const { register } = useFormContext();
  return (
    <div className={inline ? "flex gap-2 justify-between" : ""}>
      <div>
        <label className="text-gray-500 font-bold">{label}</label>
        {help && <Help text={help} />}
      </div>
      <div className="mt-1 flex gap-2">
        {options.map((option) =>
          typeof option === "string" ? (
            <React.Fragment key={option}>
              <label className="whitespace-nowrap inline-flex items-center gap-1.5">
                <input
                  {...register(name, { onChange: (e) => onChange?.(e.target.value) })}
                  type="radio"
                  name={name}
                  value={option}
                />
                {option}
              </label>
              <br />
            </React.Fragment>
          ) : (
            <React.Fragment key={option.value}>
              <label className="whitespace-nowrap inline-flex items-center gap-1.5">
                <input
                  {...register(name, { onChange: (e) => onChange?.(e.target.value) })}
                  type="radio"
                  name={name}
                  value={option.value}
                />{" "}
                {option.label}
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
