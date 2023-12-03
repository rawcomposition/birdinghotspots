import React from "react";
import Uppy from "@uppy/core";
import { DragDrop, StatusBar, useUppy } from "@uppy/react";
import ThumbnailGenerator from "@uppy/thumbnail-generator";
import { v4 as uuidv4 } from "uuid";
import "@uppy/core/dist/style.css";
import "@uppy/status-bar/dist/style.css";
import "@uppy/core/dist/style.css";
import "@uppy/drag-drop/dist/style.css";
import toast from "react-hot-toast";
import Compressor from "@uppy/compressor";
import XHR from "@uppy/xhr-upload";

type Props = {
  onSuccess: (response: any) => void;
};

declare global {
  interface Window {
    isUploading: boolean;
  }
}

export default function ImageInput({ onSuccess }: Props) {
  const uppy = useUppy(() => {
    const instance = new Uppy({
      autoProceed: true,
      restrictions: {
        allowedFileTypes: [".jpg", ".jpeg", ".png"],
      },
      onBeforeFileAdded: (file) => {
        const id = uuidv4();
        const name = `${id}.${file.extension}`;
        return {
          ...file,
          name,
          meta: { ...file.meta, name, id },
        };
      },
    });

    instance.use(XHR, { endpoint: "/api/upload-img" });

    instance.use(ThumbnailGenerator, {
      id: "ThumbnailGenerator",
      thumbnailWidth: 600,
      thumbnailHeight: 600,
      thumbnailType: "image/jpeg",
      waitForThumbnailsBeforeUpload: false,
    });

    instance.use(Compressor, {
      // @ts-ignore
      maxWidth: 2400,
      maxHeight: 2400,
    });

    instance.on("complete", (result) => {
      //@ts-ignore
      window.isUploading = false;
      const images = result.successful.map(({ preview, response: { body } }: any) => {
        console.log(body);
        return {
          ...body,
          preview,
          isNew: true, //Because isNew isn't in the Mongoose schema it gets filtered out on save
        };
      });
      onSuccess(images || []);
    });

    instance.on("restriction-failed", (file, error) => {
      toast.error(error.message);
    });

    instance.on("upload", () => {
      window.isUploading = true;
    });
    instance.on("file-removed", () => {
      window.isUploading = false;
    });

    instance.on("file-added", (file) => {
      const data = file.data;
      const url = URL.createObjectURL(data);
      const image = new Image();
      image.src = url;
      image.onload = () => {
        uppy.setFileMeta(file.id, {
          width: image.width,
          height: image.height,
        });
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
