type Props = {
  className?: string;
};

export default function BarChart({ className }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className={`icon ${className || ""}`}>
      <path d="M160 32H288V480H160V32zM0 224H128V480H0V224zM448 96V480H320V96H448z" />
    </svg>
  );
}
