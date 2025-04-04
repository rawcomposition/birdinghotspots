type Props = {
  className?: string;
};

export default function Spinner({ className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className={`icon ${className || ""}`}>
      <path d="M264 24C264 10.75 274.7 0 288 0C429.4 0 544 114.6 544 256C544 302.6 531.5 346.4 509.7 384C503.1 395.5 488.4 399.4 476.9 392.8C465.5 386.2 461.5 371.5 468.2 360C485.9 329.4 496 293.9 496 255.1C496 141.1 402.9 47.1 288 47.1C274.7 47.1 264 37.25 264 23.1V24z" />
    </svg>
  );
}
