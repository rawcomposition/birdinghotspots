import Button from "components/Button";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface SubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  [x: string]: any;
}

export default function Submit({ loading, disabled, children, ...props }: SubmitProps) {
  return (
    <Button type="submit" disabled={disabled || loading} {...props}>
      {loading ? <ArrowPathIcon className="h-7 w-7 animate-spin" /> : children}
    </Button>
  );
}
