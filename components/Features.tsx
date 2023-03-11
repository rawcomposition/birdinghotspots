import Toilets from "icons/Toilets";
import Wheelchair from "icons/Wheelchair";
import Dollar from "icons/Dollar";
import Road from "icons/Road";

type Props = {
  fee?: string;
  roadside?: string;
  accessible?: string;
  restrooms?: string;
};

export default function Features({ fee, roadside, accessible, restrooms }: Props) {
  if (!fee && !roadside && !accessible && !restrooms) return null;
  const items = [
    { label: "Restrooms on site", icon: <Toilets />, value: restrooms },
    { label: "Wheelchair accessible trail", icon: <Wheelchair />, value: accessible },
    { label: "Entrance fee", icon: <Dollar />, value: fee },
    { label: "Roadside viewing", icon: <Road />, value: roadside },
  ].filter((it) => it.value && it.value !== "Unknown");

  if (!items.length) return null;

  const yesItems = items.filter((it) => it.value === "Yes");
  const noItems = items.filter((it) => it.value === "No");

  return (
    <div className="mb-6 formatted">
      <h3 className="font-bold text-lg mb-1.5">Features</h3>
      <ul className="grid grid-cols-2 gap-4 !ml-0">
        {yesItems.map((it) => (
          <Row key={it.label} {...it} />
        ))}
        {noItems.map((it) => (
          <Row key={it.label} {...it} />
        ))}
      </ul>
    </div>
  );
}

type RowProps = {
  label: string;
  value?: string;
  icon: any;
};

function Row({ label, icon, value }: RowProps) {
  return (
    <li className="flex items-center">
      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg mr-3 text-[17px] relative">
        {icon}
        {value === "No" && (
          <div className="w-8 h-px bg-gray-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45" />
        )}
      </div>
      <p className={`text-sm font-medium text-gray-900 ${value === "No" ? "line-through" : ""}`}>{label}</p>
    </li>
  );
}
