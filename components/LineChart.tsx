import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip } from "chart.js";
import clsx from "clsx";

type Props = {
  data: {
    label: string;
    count: number;
  }[];
  className?: string;
};

export default function BarChart({ data, className }: Props) {
  if (!data) return <></>;

  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip);

  const chartData = {
    labels: data.map((it) => it.label),
    datasets: [
      {
        label: "Views",
        data: data.map((it) => it.count),
        borderColor: "rgb(230, 200, 85)",
        backgroundColor: "rgba(230, 200, 85, 0.5)",
      },
    ],
  };

  const options = {
    indexAxis: "x" as const,
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    pointRadius: 7,
    outerHeight: 200,
    maintainAspectRatio: false,
  };

  return (
    <div className={clsx("h-[300px]", className)}>
      <Line data={chartData} options={options} />
    </div>
  );
}
