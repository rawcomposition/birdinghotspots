import Select from "components/Select";
import States from "data/states.json";

const options = States.filter((state) => state.active).map(({ label, code, country }) => ({
  value: `${country}-${code}`,
  label,
}));

export default function StateSelect(props: any) {
  return <Select {...props} options={options} />;
}
