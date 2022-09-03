import { useRouter } from "next/router";
import useToast from "hooks/useToast";

type Props = {
  className?: string;
  entity: string;
  url: string;
  redirect?: string;
  children: React.ReactNode;
};

export default function DeleteBtn({ className, entity, url, redirect, children }: Props) {
  const router = useRouter();
  const { send, loading } = useToast();

  const handleClick = async () => {
    if (!confirm(`Are you sure you want to delete this ${entity.toLowerCase()}?`)) return;
    const response = await send({
      url,
      method: "GET",
      success: `${entity.charAt(0).toUpperCase() + entity.slice(1)} deleted`,
      loading: `deleting...`,
      error: `Error deleting ${entity}`,
    });
    if (response.success) {
      router.push(redirect || "/");
    }
  };

  return (
    <button type="button" onClick={handleClick} disabled={loading} className={`text-red-600 ${className || ""}`}>
      {children}
    </button>
  );
}
