import { useFormContext, Controller } from "react-hook-form";
import ReactSelectStyled from "components/ReactSelectStyled";
import { getRegion } from "lib/localData";

type Props = {
  name: string;
  stateCode: string;
  required?: boolean;
  [x: string]: any;
};

export default function CountySelect({ name, stateCode, required, ...props }: Props) {
  const { control } = useFormContext();
  const region = getRegion(stateCode);
  const counties = region?.subregions?.map(({ code, name }) => ({ value: code, label: name })) || [];
  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: required ? "This field is required" : false }}
      render={({ field: { onChange, onBlur, value, ref } }) => {
        const selected = value.length
          ? value.map((value: string) => counties?.find((item) => item.value === value))
          : [];
        const onSelect = (options: any[]) => {
          onChange(options?.map((option) => option.value));
        };
        return (
          <ReactSelectStyled options={counties || []} onChange={onSelect} onBlur={onBlur} value={selected} {...props} />
        );
      }}
    />
  );
}
