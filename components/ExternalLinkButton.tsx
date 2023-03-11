type Props = {
  children: React.ReactNode;
  href: string;
  className?: string;
  [key: string]: any;
};

export default function ExternalLinkButton({ children, className, href, ...props }: Props) {
  return (
    <a
      href={href}
      className={`text-[13px] rounded text-gray-600 bg-gray-100 px-2 inline-block font-medium whitespace-nowrap ${
        className || ""
      }`}
      target="_blank"
      rel="noreferrer"
      {...props}
    >
      {children}
    </a>
  );
}
