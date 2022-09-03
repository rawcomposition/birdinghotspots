import { useFormContext, Controller } from "react-hook-form";
import ReactSelectStyled from "components/ReactSelectStyled";
import IBAs from "data/oh-iba.json";

type InputProps = {
  name: string;
  required?: boolean;
  [x: string]: any;
};

const options = IBAs.map(({ slug, name }) => ({ value: slug, label: name }));

const Select = ({ name, required, ...props }: InputProps) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      rules={{ required: required ? "This field is required" : false }}
      render={({ field: { ref, ...field } }) => <ReactSelectStyled options={options} {...field} {...props} />}
    />
  );
};

export default Select;
