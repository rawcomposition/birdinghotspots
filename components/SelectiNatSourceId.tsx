/* eslint-disable @next/next/no-img-element */
import Select, { SelectProps } from "components/Select";
import { getSourceUrl } from "lib/species";

type Props = Omit<SelectProps, "options"> & {
  sourceIds: string[];
};

export default function SelectiNatSourceId({ sourceIds, ...props }: Props) {
  const options = sourceIds.map((id) => ({
    label: <img src={getSourceUrl({ source: "inat", sourceId: id, size: 75 }) || ""} width={60} height={60} alt={id} />,
    value: id.toString(),
  }));

  return <Select {...props} options={options as any} />;
}
