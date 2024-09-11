type Props = {
  className?: string;
};

export default function Drag({ className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512" className={`icon ${className || ""}`}>
      <path d="M64 128a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm0 160a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM96 416a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm96-288a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm32 128a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zM192 448a32 32 0 1 0 0-64 32 32 0 1 0 0 64z" />
    </svg>
  );
}
