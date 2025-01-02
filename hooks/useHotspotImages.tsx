import { eBirdImage, Image } from "lib/types";
import { useQuery } from "@tanstack/react-query";

type Props = {
  locationId: string;
  featuredImg?: Image;
};

export default function useHotspotImages({ locationId, featuredImg }: Props) {
  const { data, isFetching } = useQuery<eBirdImage[]>({
    queryKey: [`/api/hotspot/${locationId}/images`],
    enabled: !!locationId,
    refetchOnWindowFocus: true,
    meta: {
      errorMessage: "Unable to load eBird images",
    },
  });

  const ebirdImages = data || [];

  const images: Image[] = [...ebirdImages, ...(legacyImages || [])];

  return { images, isFetching };
}
