import { useFormContext, Controller } from "react-hook-form";
import AsyncSelectStyled from "components/AsyncSelectStyled";
import Highlighter from "react-highlight-words";

type Option = {
  value: string;
  label: string;
};

type Props = {
  name: string;
  regionCode?: string;
  required?: boolean;
  [x: string]: any;
};

function formatOptionLabel({ label }: any, { inputValue }: any) {
  return <Highlighter searchWords={[inputValue]} textToHighlight={label} highlightTag="b" />;
}

export default function HotspotSelect({ name, regionCode, required, ...props }: Props) {
  const { control, watch } = useFormContext();
  const value = watch(name);

  const loadOptions = async (inputValue: string, callback: (options: Option[]) => void) => {
    let ids: any = [];
    if (Array.isArray(value)) {
      ids = value.map(({ value }) => value).join(",");
    } else if (typeof value === "string") {
      ids = value;
    }
    const response = await fetch(`/api/hotspot/search?regionCode=${regionCode || ""}&q=${inputValue}&ids=${ids}`);
    const json = await response.json();
    const options = json.results;
    callback(options || []);
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={{ required: required ? "This field is required" : false }}
      render={({ field: { ref, ...field } }) => {
        return (
          <AsyncSelectStyled
            loadOptions={loadOptions}
            formatOptionLabel={formatOptionLabel}
            defaultOptions
            noOptionsMessage={({ inputValue }: any) => (inputValue.length ? "No Results" : "Search for a hotspot...")}
            {...field}
            {...props}
          />
        );
      }}
    />
  );
}
