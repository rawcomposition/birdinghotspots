import Select, { SelectProps } from "components/Select";
import { LicenseLabel } from "lib/types";

const options = Object.entries(LicenseLabel).map(([key, label]) => ({
  label,
  value: key,
}));

type Props = Omit<SelectProps, "options">;

export default function SelectRole(props: Props) {
  return <Select {...props} options={options} />;
}
