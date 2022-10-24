import * as React from "react";
import { Image } from "lib/types";
import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";
import StreetView from "components/StreetView";
import { processImg, uiElements } from "lib/photoswipe";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";

type Props = {
  photos: Image[];
};

export default function FeaturedImage({ photos }: Props) {
  const [index, setIndex] = React.useState(0);
  if (photos.length === 0) return null;
  const items = photos
    .filter(({ isStreetview }, index) => !(index === 0 && isStreetview))
    .map((photo) => processImg(photo));

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

  const current = photos[index || 0];
  const isStreetview = current.isStreetview;

  return (
    <Gallery options={{ dataSource: items }} uiElements={uiElements} withCaption>
      <Item {...processImg(current)}>
        {({ ref, open }) => {
          const imgRef = ref as any;
          return (
            <div className="relative group">
              {isStreetview ? (
                <StreetView
                  className="w-full h-[250px] sm:h-[350px] md:h-[450px] rounded-lg mb-8 -mt-10"
                  {...current.streetviewData}
                  onClick={open}
                />
              ) : (
                <img
                  ref={imgRef}
                  src={current.lgUrl || current.smUrl}
                  width={current.width}
                  height={current.height}
                  className="w-full h-[250px] sm:h-[350px] md:h-[450px] object-cover object-center rounded-lg mb-8 -mt-10 cursor-pointer"
                  onClick={open}
                />
              )}
              {items.length > 1 && (
                <>
                  <button
                    type="button"
                    className={`absolute top-4 ${
                      isStreetview ? "right-[60px]" : "right-4"
                    } flex items-center gap-2 px-3 py-0.5 text-sm font-medium bg-white  hover:opacity-100 opacity-80 rounded-sm transition-opacity`}
                    onClick={open}
                  >
                    {items.length} photos
                  </button>
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
    </Gallery>
  );
}
