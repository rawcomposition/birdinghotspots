type Props = {
  title: string;
  color: "green" | "yellow" | "blue";
};

export default function Icon({ color, title }: Props) {
  const colors = {
    green: "bg-lime-600",
    blue: "bg-sky-600",
    yellow: "bg-yellow-500",
  };

  const colorClass = colors[color] || "bg-gray-400";

  return (
    <span
      className={`${colorClass} rounded-full text-xs w-4 h-4 text-white font-bold inline-flex justify-center items-center ml-2 cursor-default`}
      title={title}
    >
      !
    </span>
  );
}
