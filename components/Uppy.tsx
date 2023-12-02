import React from "react";
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
import Compressor from "@uppy/compressor";

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
        maxFileSize: 1024 * 1024 * 10, //10MB
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

    instance.use(Transloadit, {
      waitForEncoding: true,
      params: {
        auth: { key: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY || "" },
        template_id: process.env.NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID || "",
      },
      // @ts-ignore
      getAssemblyOptions: (file, options) => {
        const isLarge = file.size > 1024 * 700; //700kb
        return {
          params: {
            ...options.params,
            template_id: isLarge
              ? process.env.NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID_LARGE
              : process.env.NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID,
          },
          signature: options.signature,
          fields: options.fields,
        };
      },
    });

    instance.use(ThumbnailGenerator, {
      id: "ThumbnailGenerator",
      thumbnailWidth: 600,
      thumbnailHeight: 600,
      thumbnailType: "image/jpeg",
      waitForThumbnailsBeforeUpload: false,
    });

    instance.use(Compressor, {
      quality: 0.5,
      // @ts-ignore
      maxWidth: 2400,
      maxHeight: 2400,
      mimeType: "image/jpeg",
      convertType: ["image/png"],
      convertSize: 0,
    });

    instance.on("complete", (result) => {
      window.isUploading = false;
      const images = result.successful.map((file: any) => {
        return {
          xsUrl: `https://s3.us-east-1.wasabisys.com/birdinghotspots/${file.meta.id}_xsmall.jpg`,
          smUrl: `https://s3.us-east-1.wasabisys.com/birdinghotspots/${file.meta.id}_small.jpg`,
          lgUrl: `https://s3.us-east-1.wasabisys.com/birdinghotspots/${file.meta.id}_large.jpg`,
          preview: file.preview,
          by: null,
          width: file.meta.width || null,
          height: file.meta.height || null,
          isMap: false,
          isNew: true,
          size: file.size,
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
