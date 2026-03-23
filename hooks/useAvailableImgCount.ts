import { useQuery } from "@tanstack/react-query";
import { ENABLE_PHOTO_SYNC } from "lib/config";

export default function useAvailableImgCount(locationId: string) {
  const { data, isLoading, error, refetch } = useQuery<{ count: number }>({
    queryKey: ["/api/count-ml-photos", { locationId }],
    enabled: !!locationId && ENABLE_PHOTO_SYNC,
  });

  if (!ENABLE_PHOTO_SYNC) {
    return { count: "Unknown", isLoading: false, error: null, refetch };
  }

  const count = data?.count || 0;

  return { count: count > 10 ? "> 10" : count.toString(), isLoading, error, refetch };
}
