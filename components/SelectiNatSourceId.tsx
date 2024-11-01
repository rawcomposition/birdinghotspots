/* eslint-disable @next/next/no-img-element */
import Select, { SelectProps } from "components/Select";
import { getSourceImgUrl } from "lib/species";

type Props = Omit<SelectProps, "options"> & {
  sourceIds: string[];
  iNatFileExts?: string[];
};

export default function SelectiNatSourceId({ sourceIds, iNatFileExts, ...props }: Props) {
  const options = sourceIds.map((id, index) => ({
    label: (
      <img
        src={getSourceImgUrl({ source: "inat", sourceId: id, size: 75, ext: iNatFileExts?.[index] }) || ""}
        width={60}
        height={60}
        alt={id}
      />
    ),
    value: id.toString(),
  }));

  return <Select {...props} options={options as any} />;
}
