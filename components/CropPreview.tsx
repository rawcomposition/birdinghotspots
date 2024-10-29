/* eslint-disable @next/next/no-img-element */
import React from "react";

type CropPreviewProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  imgUrl: string;
};

const PREVIEW_WIDTH = 120;
const ASPECT_RATIO = 3 / 4;

const CropPreview = React.memo(({ x, y, width, height, imgUrl }: CropPreviewProps) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [croppedImageUrl, setCroppedImageUrl] = React.useState<string | null>(null);

  const proxyImgUrl = React.useMemo(() => getProxyImgUrl(imgUrl), [imgUrl]);

  React.useEffect(() => {
    const image = new Image();
    image.src = proxyImgUrl;

    image.onload = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const previewWidth = PREVIEW_WIDTH * 2;
          const previewHeight = PREVIEW_WIDTH * ASPECT_RATIO * 2;
          canvas.width = previewWidth;
          canvas.height = previewHeight;

          // Calculate the crop area in pixels
          const cropX = (x / 100) * image.width;
          const cropY = (y / 100) * image.height;
          const cropWidth = (width / 100) * image.width;
          const cropHeight = (height / 100) * image.height;

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, previewWidth, previewHeight);

          canvas.toBlob((blob) => {
            if (blob) {
              const croppedUrl = URL.createObjectURL(blob);
              setCroppedImageUrl(croppedUrl);
            }
          });
        }
      }
    };
  }, [x, y, width, height, proxyImgUrl]);

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      {croppedImageUrl && (
        <img
          src={croppedImageUrl}
          alt="Cropped Preview"
          width={PREVIEW_WIDTH}
          height={PREVIEW_WIDTH * ASPECT_RATIO}
          style={{
            width: PREVIEW_WIDTH,
            height: PREVIEW_WIDTH * ASPECT_RATIO,
          }}
          className="object-cover rounded"
        />
      )}
    </div>
  );
});

CropPreview.displayName = "CropPreview";

export default CropPreview;

const getProxyImgUrl = (url: string) => {
  return url
    .replace("https://inaturalist-open-data.s3.amazonaws.com/", "/api/image-proxy/inat/")
    .replace("https://cdn.download.ams.birds.cornell.edu/", "/api/image-proxy/ebird/")
    .replace("https://upload.wikimedia.org/", "/api/image-proxy/wikipedia/")
    .replace("https://live.staticflickr.com/", "/api/image-proxy/flickr/");
};
