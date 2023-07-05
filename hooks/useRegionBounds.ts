import * as React from "react";
import toast from "react-hot-toast";

type RegionBounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export default function useRegionBounds(region?: string) {
  const [bounds, setBounds] = React.useState<RegionBounds | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!region) return;
    const fetchBounds = async () => {
      setLoading(true);
      const res = await fetch(
        `https://api.ebird.org/v2/ref/region/info/${region}?key=${process.env.NEXT_PUBLIC_EBIRD_API}`
      );
      const json = await res.json();
      setLoading(false);
      if (!json.bounds) {
        toast.error("Error loading region data");
        return;
      }
      setBounds((json.bounds as RegionBounds) || null);
    };
    fetchBounds();
  }, [region]);

  return { regionBounds: bounds, loadingBounds: loading };
}
