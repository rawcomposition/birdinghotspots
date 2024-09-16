/* eslint-disable @next/next/no-img-element */
import { useController } from "react-hook-form";
import Cropper from "react-easy-crop";
import React from "react";

type Props = {
  name: string;
  url: string;
  className?: string;
};

type Value = {
  crop: {
    percent: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    pixel: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
};

export default function InputImageCrop({ className, name, url }: Props) {
  const { field } = useController({ name });
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(2);

  const value: Value = field.value;

  return (
    <div className={className}>
      <div className="w-full h-[420px] relative">
        <Cropper
          image={url}
          crop={crop}
          zoom={zoom}
          aspect={3 / 2}
          onCropChange={setCrop}
          onCropComplete={(croppedArea, croppedAreaPixels) => {
            field.onChange({
              crop: {
                percent: {
                  x: croppedArea.x,
                  y: croppedArea.y,
                  width: croppedArea.width,
                  height: croppedArea.height,
                },
                pixel: {
                  x: croppedAreaPixels.x,
                  y: croppedAreaPixels.y,
                  width: croppedAreaPixels.width,
                  height: croppedAreaPixels.height,
                },
              },
            });
          }}
          onZoomChange={setZoom}
        />
      </div>
      <div className="flex gap-4 mt-4">
        <Preview {...value.crop.percent} url={url} />
        <Preview {...value.crop.percent} url={url} square />
      </div>
    </div>
  );
}

type PreviewProps = {
  x: number;
  y: number;
  width: number;
  url: string;
  square?: boolean;
};

const Preview = ({ x, y, width, url, square }: PreviewProps) => {
  const scale = 100 / width;
  const transform = `translate3d(${-x * scale}%, ${-y * scale}%, 0) scale(${scale})`;
  const containerStyle = square ? { aspectRatio: "1 / 1" } : { aspectRatio: "3 / 2" };

  return (
    <div className="h-[160px] relative overflow-hidden" style={containerStyle}>
      <img
        src={url}
        alt=""
        style={{
          transform,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        className="absolute top-0 left-0 origin-top-left"
      />
    </div>
  );
};
