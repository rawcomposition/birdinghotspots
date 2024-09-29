/* eslint-disable @next/next/no-img-element */
import { useController, useFormContext } from "react-hook-form";
import Cropper from "react-easy-crop";
import React from "react";
import { Crop } from "lib/types";
import CropPreview from "components/CropPreview";
import { useDebounce } from "hooks/useDebounce";

type Props = {
  name: string;
  url: string;
  className?: string;
};

export default function InputImageCrop({ className, name, url }: Props) {
  const {
    formState: { defaultValues },
  } = useFormContext();
  const { field } = useController({ name });
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);

  const value: Crop = field.value;
  const debouncedCrop = useDebounce(value?.percent, 100);

  return (
    <div className={className}>
      <div className="w-full h-[420px] relative">
        <Cropper
          image={url}
          crop={crop}
          zoom={zoom}
          aspect={1}
          zoomSpeed={0.25}
          onCropChange={setCrop}
          onCropComplete={(croppedArea, croppedAreaPixels) => {
            field.onChange({
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
            } as Crop);
          }}
          onZoomChange={setZoom}
          initialCroppedAreaPercentages={defaultValues?.[name]?.percent}
        />
      </div>
      <div className="flex gap-4 mt-4">
        <CropPreview {...debouncedCrop} imgUrl={url} />
        <CropPreview {...debouncedCrop} imgUrl={url} round />
      </div>
    </div>
  );
}
