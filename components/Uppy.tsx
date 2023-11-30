import React from "react";
import Uppy from "@uppy/core";
import { DragDrop, StatusBar, useUppy } from "@uppy/react";
import XHR from "@uppy/xhr-upload";
import ThumbnailGenerator from "@uppy/thumbnail-generator";
import "@uppy/core/dist/style.css";
import "@uppy/status-bar/dist/style.css";
import "@uppy/core/dist/style.css";
import "@uppy/drag-drop/dist/style.css";
import toast from "react-hot-toast";

type Props = {
  onSuccess: (response: any) => void;
};

export default function ImageInput({ onSuccess }: Props) {
  const uppy = useUppy(() => {
    const instance = new Uppy({
      autoProceed: true,
      restrictions: {
        allowedFileTypes: [".jpg", ".jpeg", ".png"],
      },
    });

    instance.use(XHR, { endpoint: "/api/upload-img" });

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
      const images = result.successful.map(({ preview, response: { body } }: any) => {
        console.log({
          ...body,
          preview,
          isNew: true, //Because isNew isn't in the Mongoose schema it gets filtered out on save
        });
        return {
          ...body,
          preview,
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

    return instance;
  });

  return (
    <>
      <DragDrop uppy={uppy} />
      <StatusBar uppy={uppy} hideUploadButton showProgressDetails />
    </>
  );
}
