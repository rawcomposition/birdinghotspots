import { Image } from "lib/types";
import { useQuery } from "@tanstack/react-query";

type Props = {
  locationId: string;
  featuredImg?: Image;
  hasFeaturedEbirdId: boolean;
};

export default function useHotspotImages({ locationId, featuredImg, hasFeaturedEbirdId }: Props) {
  const { data, isFetching } = useQuery<Image[]>({
    queryKey: [`/api/hotspot/${locationId}/images?getBest=${!!hasFeaturedEbirdId}`],
    enabled: !!locationId,
    refetchOnWindowFocus: true,
    meta: {
      errorMessage: "Unable to load eBird images",
    },
  });

  const latestImages = data || [];

  const images: Image[] = latestImages.length > 0 ? latestImages : featuredImg ? [featuredImg] : [];

  return { images, isFetching };
}
