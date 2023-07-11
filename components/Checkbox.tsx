import { useFormContext, Controller } from "react-hook-form";

type InputProps = {
  name: string;
  label: string;
};

const Checkbox = ({ name, label }: InputProps) => {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              onChange={(e) => onChange(e.target.checked)}
              checked={!!value}
              className="h-4 w-4 rounded border-gray-300 text-accent-600 focus:ring-accent-500"
              name={name}
              value={value}
            />{" "}
            {label}
          </label>
        </div>
      )}
    />
  );
};

export default Checkbox;
