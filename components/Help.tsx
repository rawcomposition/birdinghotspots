import { clsx } from "clsx";
import Info from "icons/Info";
import { useModal } from "providers/modals";

type PropsT = {
  heading: string;
  text: string | React.ReactNode;
  className?: string;
  as?: "button" | "span";
};

export default function HelpIcon({ heading, text, className, as = "button" }: PropsT) {
  const { open } = useModal();
  const Component = as === "button" ? "button" : "span";
  return (
    <Component
      type={as === "button" ? "button" : undefined}
      aria-label="Help"
      className={clsx("group cursor-pointer px-1.5", className)}
      onClick={() =>
        open("popover", {
          title: heading,
          text: <div className="flex flex-col gap-1">{text}</div>,
        })
      }
    >
      <Info className="text-[16px] text-slate-500 ml-1 -mt-px cursor-pointer" />
    </Component>
  );
}
