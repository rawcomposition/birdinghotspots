import { GalleryProps } from "react-photoswipe-gallery";
import { Image } from "lib/types";
import StreetView from "components/StreetView";
import { getFileUrl } from "./s3";

export const uiElements: GalleryProps["uiElements"] = [
  {
    name: "download",
    ariaLabel: "Download",
    order: 9,
    isButton: true,
    html: {
      isCustomSVG: true,
      inner:
        '<path d="M20.5 14.3 17.1 18V10h-2.2v7.9l-3.4-3.6L10 16l6 6.1 6-6.1ZM23 23H9v2h14Z" id="pswp__icn-download"></path>',
      outlineID: "pswp__icn-download",
    },
    appendTo: "bar",
    onClick: (e: any, el: any, pswpInstance: any) => {
      const url = pswpInstance.currSlide.data.downloadUrl;
      window.location.href = `/api/file/download?url=${url}`;
    },
    onInit: (el: HTMLElement, pswpInstance: any) => {
      pswpInstance.on("change", () => {
        const url = pswpInstance.currSlide.data.downloadUrl;
        if (!url) {
          el.classList.add("hidden");
        } else {
          el.classList.remove("hidden");
        }
      });
    },
  },
];

export const processImg = (image: Image) => {
  if (image.isStreetview) {
    return {
      content: (
        <StreetView
          style={{ width: "100%", height: "calc(100% - 60px)", marginTop: "60px" }}
          {...image.streetviewData}
        />
      ),
      caption: "",
    };
  }
  let caption = "";
  if (image.caption) {
    caption = image.caption;
  }
  if (image.ebirdId) {
    caption = `
      ${image.caption ? `${image.caption}<br />` : ""}
      By ${image.by}
      &nbsp;•&nbsp;
      ${image.ebirdDateDisplay || "Unknown Date"}
      &nbsp;•&nbsp;
      <a
        href={https://macaulaylibrary.org/asset/${image.ebirdId}}
        class="font-medium"
        target="_blank"
        rel="noopener noreferrer"
      >
        ML${image.ebirdId}
      </a>`;
  } else if (image.by) {
    console.log("TWO");
    //console.log("TEST2", image);
    //caption = image.caption ? `${image.caption}<br />Photo by ${image.by}` : `Photo by ${image.by}`;
  }
  console.log("CAPTION", caption);
  return {
    src: getFileUrl(image.lgUrl || image.smUrl),
    width: image.width,
    height: image.height,
    caption,
    downloadUrl: getFileUrl(image.lgUrl || image.smUrl),
  };
};
