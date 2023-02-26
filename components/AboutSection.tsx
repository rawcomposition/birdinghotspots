import Link from "next/link";
type Props = {
  text: string;
  link?: string;
  heading: string;
};

export default function AboutSection({ text, heading, link }: Props) {
  return (
    <div className="mb-6 formatted">
      <h3 className="font-bold text-lg mb-1.5">
        {heading}
        {link && (
          <>
            {" "}
            <Link href={link} className="text-sm">
              (Read More)
            </Link>
          </>
        )}
      </h3>
      <div dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  );
}
