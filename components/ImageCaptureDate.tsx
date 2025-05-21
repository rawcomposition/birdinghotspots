import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(utc);
dayjs.extend(customParseFormat);

type ExifData = {
  captureDate: Date | null;
  rawExif: any;
};

type Props = {
  imgUrl?: string;
  className?: string;
  dateFormat?: string;
  noDataText?: string;
};

export default function ImageCaptureDate({
  imgUrl,
  className = "",
  dateFormat = "MMM D, YYYY",
  noDataText = "Unknown",
}: Props) {
  const { data, isLoading } = useQuery<ExifData>({
    queryKey: ["/api/image/exif", { imgUrl }],
    enabled: !!imgUrl,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const captureDate = data?.captureDate;

  if (!imgUrl || isLoading || !captureDate) {
    return <span className={className}>{noDataText}</span>;
  }

  return <span className={className}>{dayjs.utc(captureDate, "YYYY:MM:DD HH:mm:ss").format(dateFormat)}</span>;
}
