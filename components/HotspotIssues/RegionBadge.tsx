import { useQuery } from "@tanstack/react-query";
import { EBirdRegion } from "lib/types";

export default function RegionBadge({ region }: { region: string }) {
  const { data, isLoading } = useQuery<EBirdRegion>({
    queryKey: [`https://api.ebird.org/v2/ref/region/info/${region}`, { key: process.env.NEXT_PUBLIC_EBIRD_API }],
    enabled: !!region,
  });

  let displayText = data?.result || region;
  if (data?.parent?.result) {
    displayText = displayText.replace(`, ${data?.parent?.result}`, "");
  }
  return (
    <span className="rounded-full px-2 py-px bg-purple-100 text-purple-800 text-xs font-semibold">{displayText}</span>
  );
}
