import { Image } from "lib/types";
import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";
import { processImg, uiElements } from "lib/photoswipe";

type Props = {
  photos: Image[];
};

export default function FeaturedCollage({ photos }: Props) {
  if (photos.length === 0) return null;
  const items = photos
    .filter(({ isStreetview }, index) => !(index === 0 && isStreetview))
    .map((photo) => processImg(photo));
  const slice = items.length === 4 ? 3 : 5;
  const featured = photos.slice(0, slice);

  return (
    <div
      className={`relative w-full h-[250px] sm:h-[350px] md:h-[450px] rounded-lg mb-8 -mt-10 overflow-hidden collage-${featured.length}`}
    >
      <Gallery options={{ dataSource: items }} uiElements={uiElements} withCaption>
        {featured.map((photo, index) => (
          <Item {...processImg(photo)} key={photo.smUrl}>
            {({ ref, open }) => {
              const imgRef = ref as any;
              return (
                <img
                  ref={imgRef}
                  src={photo.lgUrl || photo.smUrl}
                  width={photo.width}
                  height={photo.height}
                  className="w-full h-full object-cover object-center cursor-pointer"
                  onClick={open}
                />
              );
            }}
          </Item>
        ))}
      </Gallery>
    </div>
  );
}
