import { Image } from "lib/types";
import { Gallery, Item } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";
import { uiElements } from "lib/photoswipe";

type Props = {
  images: Image[];
};

export default function MapGrid({ images }: Props) {
  const items = images.map((image) => ({
    original: image.lgUrl || image.smUrl,
    thumbnail: image.lgUrl && image.height && image.width && image.height > image.width ? image.lgUrl : image.smUrl,
    width: image.width,
    height: image.height,
    by: image.by,
    caption: image.caption,
    downloadUrl: image.originalUrl || image.lgUrl || image.smUrl,
  }));

  if (items.length === 0) return null;

  return (
    <div className="bg-gray-100 p-3 rounded-md">
      <h4 className="text-gray-500 font-bold">Group Maps</h4>
      <div className="grid lg:grid-cols-4 gap-4 mt-1">
        <Gallery uiElements={uiElements} withCaption>
          {items.map((item) => (
            <article key={item.original} className="flex flex-col gap-2 rounded bg-gray-50 border cursor-pointer">
              <Item key={item.original} {...item}>
                {({ ref, open }) => {
                  const imgRef = ref as any;
                  return (
                    <img
                      ref={imgRef}
                      onClick={open}
                      src={item.thumbnail}
                      className="w-full aspect-square bg-zinc-700 object-cover"
                      width={item.width}
                      height={item.height}
                      loading="lazy"
                    />
                  );
                }}
              </Item>
            </article>
          ))}
        </Gallery>
      </div>
    </div>
  );
}
