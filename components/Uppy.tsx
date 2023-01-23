import * as React from "react";
import Uppy from "@uppy/core";
import { DragDrop, StatusBar, useUppy } from "@uppy/react";
import Transloadit from "@uppy/transloadit";
import ThumbnailGenerator from "@uppy/thumbnail-generator";
import { v4 as uuidv4 } from "uuid";
import "@uppy/core/dist/style.css";
import "@uppy/status-bar/dist/style.css";
import "@uppy/core/dist/style.css";
import "@uppy/drag-drop/dist/style.css";
import toast from "react-hot-toast";

type Props = {
  onSuccess: (response: any) => void;
};

export default function ImageInput({ onSuccess }: Props) {
  const [previews, setPreviews] = React.useState<any>({});
  const previewsRef = React.useRef<any>(null);
  previewsRef.current = previews;

  const uppy = useUppy(() => {
    const instance = new Uppy({
      autoProceed: true,
      restrictions: {
        allowedFileTypes: [".jpg", ".jpeg", ".png"],
      },
      onBeforeFileAdded: (file) => {
        const name = `${uuidv4()}.${file.extension}`;
        return {
          ...file,
          name,
          meta: { ...file.meta, name },
        };
      },
    });

    instance.use(Transloadit, {
      waitForEncoding: true,
      params: {
        auth: { key: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY || "" },
        template_id: process.env.NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID || "",
      },
    });

    instance.use(ThumbnailGenerator, {
      id: "ThumbnailGenerator",
      thumbnailWidth: 300,
      thumbnailHeight: 300,
      thumbnailType: "image/jpeg",
      waitForThumbnailsBeforeUpload: false,
    });

    instance.on("complete", (result) => {
      //@ts-ignore
      window.isUploading = false;
      const images = result.successful.map((file: any) => {
        const preview = previewsRef.current ? previewsRef.current[file.id] : null;
        const baseName = file.name.split(".")[0];
        const ext = file.extension?.toLowerCase();
        return {
          //Transloadit converts .jpeg to jpg for small and large images. .jpeg will be retained for originals
          smUrl: `https://s3.us-east-1.wasabisys.com/birdinghotspots/${baseName}_small.${ext === "jpeg" ? "jpg" : ext}`,
          lgUrl: `https://s3.us-east-1.wasabisys.com/birdinghotspots/${baseName}_large.${ext === "jpeg" ? "jpg" : ext}`,
          originalUrl: `https://s3.us-east-1.wasabisys.com/birdinghotspots/${baseName}_original.${ext}`,
          preview: preview,
          by: null,
          width: file.meta.width || null,
          height: file.meta.height || null,
          isMap: false,
          isNew: true, //Because isNew isn't in the Mongoose schema it gets filtered out on save
        };
      });
      onSuccess(images || []);
    });

    instance.on("restriction-failed", () => {
      toast.error("Only images are allowed");
    });

    instance.on("upload", () => {
      //@ts-ignore
      window.isUploading = true;
    });
    instance.on("file-removed", () => {
      //@ts-ignore
      window.isUploading = false;
    });

    instance.on("thumbnail:generated", (file, preview) => {
      setPreviews((current: any) => ({ ...current, [file.id]: preview }));
    });

    instance.on("file-added", (file) => {
      const data = file.data;
      const url = URL.createObjectURL(data);
      const image = new Image();
      image.src = url;
      image.onload = () => {
        uppy.setFileMeta(file.id, { width: image.width, height: image.height });
        URL.revokeObjectURL(url);
      };
    });
    return instance;
  });

  return (
    <>
      <DragDrop uppy={uppy} />
      <StatusBar uppy={uppy} hideUploadButton showProgressDetails />
    </>
  );
}
