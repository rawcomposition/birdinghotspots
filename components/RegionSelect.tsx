type Option = {
  value: string;
  label: string;
};

import { useFormContext, Controller } from "react-hook-form";
import AsyncSelectStyled from "components/AsyncSelectStyled";

type Props = {
  name: string;
  required?: boolean;
  isMulti?: boolean;
  restrict?: boolean;
  [x: string]: any;
};

export default function Select({ name, required, isMulti, options, restrict, ...props }: Props) {
  const { control } = useFormContext();

  const loadOptions = (inputValue: string, callback: (options: Option[]) => void) => {
    (async () => {
      const response = await fetch(`/api/region-search?q=${inputValue}&restrict=${restrict ? "true" : "false"}`);
      const json = await response.json();
      callback(json.results || []);
    })();
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: required ? "This field is required" : false }}
      render={({ field: { onChange, value, ref, ...field } }) => {
        return (
          <AsyncSelectStyled
            loadOptions={loadOptions}
            onChange={onChange}
            value={value}
            cacheOptions
            defaultOptions
            isMulti={isMulti}
            noOptionsMessage={({ inputValue }: any) => (inputValue.length ? "No Results" : "Select...")}
            {...field}
            {...props}
          />
        );
      }}
    />
  );
}
