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
  locationId: string;
};

export default function FeaturedImage({ photos, isLoading, locationId }: Props) {
  const [index, setIndex] = React.useState(0);
  const items = photos.map((photo) => processImg(photo));
  const indexRef = React.useRef(index);
  indexRef.current = index;
  if (photos.length === 0) return null;

  const hasMlImages = photos.some((photo) => photo.ebirdId);

  const allItems = hasMlImages
    ? [
        ...items,
        {
          content: <MacaulayLibraryBanner locationId={locationId} />,
          caption: "",
        },
      ]
    : items;

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    if (index === 0) {
      setIndex(allItems.length - 1);
      return;
    }
    setIndex(index - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (index === allItems.length - 1) {
      setIndex(0);
      return;
    }
    setIndex(index + 1);
  };

  return (
    <Gallery options={{ dataSource: allItems }} uiElements={uiElements} withCaption>
      {allItems.map((item, i) => (
        <Item key={i} {...item}>
          {({ ref, open }) => {
            const imgRef = ref as any;
            return (
              <figure className={`relative group ${index === i ? "block" : "hidden"}`} ref={imgRef}>
                {item.content ? (
                  <figure className="h-[250px] sm:h-[350px] md:h-[450px] relative group" ref={ref}>
                    {item.content}
                  </figure>
                ) : photos[i].isStreetview ? (
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
                  allItems.length > 1 && (
                    <button
                      type="button"
                      className="absolute top-4 right-4 flex items-center gap-2 px-3 py-0.5 text-sm font-medium bg-white  hover:opacity-100 opacity-80 rounded-sm transition-opacity"
                      onClick={open}
                    >
                      {photos.length} {photos.length === 1 ? "photo" : "photos"}
                    </button>
                  )
                )}
                {allItems.length > 1 && (
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
                {photos[i]?.ebirdId && (
                  <figcaption className="text-[13px] leading-4 text-gray-300 absolute bottom-0 left-0 right-0 py-2 px-4 bg-gray-900 rounded-b-lg flex items-center">
                    {photos[i].by}
                    <span className="rounded-full bg-gray-600 text-gray-300 w-[5px] h-[5px] mx-2.5" />
                    <span className="text-gray-300">{photos[i].ebirdDateDisplay || "Unknown Date"}</span>
                    <span className="rounded-full bg-gray-600 text-gray-300 w-[5px] h-[5px] mx-2.5" />
                    <a
                      href={`https://macaulaylibrary.org/asset/${photos[i].ebirdId}`}
                      className="font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ML{photos[i].ebirdId}
                    </a>
                  </figcaption>
                )}
              </figure>
            );
          }}
        </Item>
      ))}
    </Gallery>
  );
}

export const MacaulayLibraryBanner = ({ locationId }: { locationId: string }) => {
  return (
    <div className="w-full h-full rounded-lg mb-8 -mt-10 flex items-center justify-center">
      <div className="w-72 h-72 bg-white rounded-full flex flex-col gap-6 items-center justify-center p-8 text-center">
        <img
          src="https://clo-brand-static-prod.s3.amazonaws.com/logos/clo/clo_primary_web.svg"
          alt="Cornell Lab Logo"
          className="w-32 h-12"
        />
        <p className="text-gray-700 text-sm font-medium">More may be available in the Macaulay Library</p>
        <a
          href={`https://media.ebird.org/catalog?regionCode=${locationId}&mediaType=photo&sort=rating_rank_desc&view=grid&tag=environmental`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary hover:bg-secondary text-white font-bold py-1.5 text-sm px-4 rounded-full inline-flex items-center"
        >
          Browse Photos
        </a>
      </div>
    </div>
  );
};
