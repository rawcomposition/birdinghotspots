import { useRouter } from "next/router";

export function useReloadProps() {
  const router = useRouter();
  const reload = () => router.replace(router.asPath);
  return reload;
}
