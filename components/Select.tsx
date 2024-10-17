import { useFormContext, Controller } from "react-hook-form";
import ReactSelectStyled from "components/ReactSelectStyled";

export type SelectProps = {
  name: string;
  required?: boolean;
  isMulti?: boolean;
  label?: string | React.ReactNode;
  isClearable?: boolean;
  options: {
    value: string;
    label: string;
  }[];
  onChange?: (value: any) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  instanceId?: string;
  disabled?: boolean;
  menuPortalTarget?: HTMLElement;
};

export default function Select({ name, required, isMulti, options, onChange: customOnChange, ...props }: SelectProps) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: required ? "This field is required" : false }}
      render={({ field: { onChange, value, ref, ...field } }) => {
        let selected = null;
        if (isMulti) {
          selected = value?.length ? value.map((value: string) => options?.find((it) => it.value === value)) : [];
        } else {
          selected = options?.find((it) => it.value === value);
        }
        const onSelect = (value: any) => {
          if (isMulti) {
            customOnChange?.(value?.map((option: any) => option.value));
            onChange(value?.map((option: any) => option.value));
          } else {
            customOnChange?.(value?.value);
            onChange(value?.value);
          }
        };
        return (
          <ReactSelectStyled
            options={options}
            onChange={onSelect}
            value={selected}
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
