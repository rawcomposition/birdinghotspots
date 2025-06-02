import { useQuery } from "@tanstack/react-query";

export default function useAvailableImgCount(locationId: string) {
  const { data, isLoading, error, refetch } = useQuery<{ count: number }>({
    queryKey: ["/api/count-ml-photos", { locationId }],
    enabled: !!locationId,
  });

  const count = data?.count || 0;

  return { count: count > 10 ? "> 10" : count.toString(), isLoading, error, refetch };
}
