type Props = {
  region: string;
  portal?: string;
};

export default function EbirdBarcharts({ region, portal }: Props) {
  const base = portal ? `https://ebird.org/${portal}` : "https://ebird.org";
  return (
    <section className="mb-6 p-2 border-2 border-primary rounded">
      <h3 className="font-bold text-lg">Explore in eBird</h3>
      <p>
        <a href={`${base}/barchart?yr=all&bmo=1&emo=12&r=${region}`} target="_blank" rel="noreferrer">
          Entire Year
        </a>
        &nbsp;–&nbsp;
        <a href={`${base}/barchart?yr=all&bmo=3&emo=5&r=${region}`} target="_blank" rel="noreferrer">
          Spring
        </a>
        &nbsp;–&nbsp;
        <a href={`${base}/barchart?yr=all&bmo=6&emo=7&r=${region}`} target="_blank" rel="noreferrer">
          Summer
        </a>
        &nbsp;–&nbsp;
        <a href={`${base}/barchart?yr=all&bmo=8&emo=11&r=${region}`} target="_blank" rel="noreferrer">
          Fall
        </a>
        &nbsp;–&nbsp;
        <a href={`${base}/barchart?yr=all&bmo=12&emo=2&r=${region}`} target="_blank" rel="noreferrer">
          Winter
        </a>
      </p>
    </section>
  );
}
