import React from "react";
import { Image } from "lib/types";
import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";
import StreetView from "components/StreetView";
import { processImg, uiElements } from "lib/photoswipe";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import { getFileUrl } from "lib/s3";
import Spinner from "icons/Spinner";

type Props = {
  photos: Image[];
  isLoading: boolean;
};

export default function FeaturedImage({ photos, isLoading }: Props) {
  const [index, setIndex] = React.useState(0);
  const items = photos.map((photo) => processImg(photo));
  const indexRef = React.useRef(index);
  indexRef.current = index;
  if (photos.length === 0) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    if (index === 0) {
      setIndex(items.length - 1);
      return;
    }
    setIndex(index - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (index === items.length - 1) {
      setIndex(0);
      return;
    }
    setIndex(index + 1);
  };

  return (
    <Gallery options={{ dataSource: items }} uiElements={uiElements} withCaption>
      {items.map((item, i) => (
        <Item key={i} {...item}>
          {({ ref, open }) => {
            const imgRef = ref as any;
            return (
              <div className={`relative group ${index === i ? "block" : "hidden"}`} ref={imgRef}>
                {photos[i].isStreetview ? (
                  <StreetView
                    className="w-full h-[250px] sm:h-[350px] md:h-[450px] rounded-lg mb-8 -mt-10"
                    {...photos[i].streetviewData}
                    onClick={open}
                  />
                ) : (
                  <img
                    ref={imgRef}
                    //Prevent loading images unless viewed
                    src={index === i ? getFileUrl(photos[i].lgUrl || photos[i].smUrl) : ""}
                    width={item.width}
                    height={item.height}
                    className="w-full h-[250px] sm:h-[350px] md:h-[450px] object-cover object-center rounded-lg mb-8 -mt-10 cursor-pointer"
                    onClick={open}
                  />
                )}
                {isLoading ? (
                  <span
                    className="absolute top-4 right-4 flex items-center gap-2 px-2 py-0.5 text-sm font-medium bg-white opacity-80 rounded-sm"
                    onClick={open}
                  >
                    <Spinner className="animate-spin my-[2px]" />
                  </span>
                ) : (
                  items.length > 1 && (
                    <button
                      type="button"
                      className="absolute top-4 right-4 flex items-center gap-2 px-3 py-0.5 text-sm font-medium bg-white  hover:opacity-100 opacity-80 rounded-sm transition-opacity"
                      onClick={open}
                    >
                      {items.length} photos
                    </button>
                  )
                )}
                {items.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="absolute bg-white w-8 h-8 rounded-full pl-0.5 cursor-pointer top-1/2 right-[0.85rem] -translate-y-1/2 flex items-center justify-center opacity-50 group-hover:opacity-60 group-hover:right-4 transition-all hover:!opacity-80"
                      onClick={handleNext}
                    >
                      <ChevronRightIcon className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      className="absolute bg-white w-8 h-8 rounded-full pr-0.5 cursor-pointer top-1/2 left-[0.85rem] -translate-y-1/2 flex items-center justify-center opacity-50 group-hover:opacity-60 group-hover:left-4 transition-all hover:!opacity-80"
                      onClick={handlePrev}
                    >
                      <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
            );
          }}
        </Item>
      ))}
    </Gallery>
  );
}
