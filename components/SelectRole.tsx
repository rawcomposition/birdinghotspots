import Select, { SelectProps } from "components/Select";
import { ImgSourceLabel } from "lib/types";

const options = Object.entries(ImgSourceLabel).map(([key, label]) => ({
  label,
  value: key,
}));

type Props = Omit<SelectProps, "options">;

export default function SelectRole(props: Props) {
  return <Select {...props} options={options} />;
}
