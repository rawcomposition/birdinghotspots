import React from "react";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import Form from "components/Form";
import Submit from "components/Submit";
import { getSpeciesByCode } from "lib/mongo";
import AdminPage from "components/AdminPage";
import { SpeciesT } from "lib/types";
import useToast from "hooks/useToast";
import Uppy from "@uppy/core";
import { DragDrop, StatusBar, useUppy } from "@uppy/react";
import Transloadit from "@uppy/transloadit";
import { v4 as uuidv4 } from "uuid";
import "@uppy/core/dist/style.css";
import "@uppy/status-bar/dist/style.css";
import "@uppy/core/dist/style.css";
import "@uppy/drag-drop/dist/style.css";
import Input from "components/Input";
import Field from "components/Field";

type Props = {
  id: string;
  data: SpeciesT;
};

export default function Edit({ id, data }: Props) {
  const [sm, setSm] = React.useState<string | null>(null);
  const [md, setMd] = React.useState<string | null>(null);
  const [lg, setLg] = React.useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = React.useState<string | null>(null);
  const { send, loading } = useToast();

  const router = useRouter();
  const form = useForm<any>({ defaultValues: data });

  const handleSubmit: SubmitHandler<any> = async (data) => {
    const response = await send({
      url: `/api/species/${id}/update`,
      method: "PUT",
      data: {
        ...data,
        sm,
        md,
        lg,
        originalUrl,
      },
    });
    if (response.success) {
      router.push(response.url);
    }
  };

  const uppy = useUppy(() => {
    const instance = new Uppy({
      autoProceed: true,
      restrictions: {
        maxNumberOfFiles: 1,
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
        auth: { key: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY_DEV || "" },
        template_id: process.env.NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID_DEV || "",
      },
    });

    instance.on("complete", (result) => {
      const file = result.successful[0];
      const baseName = file.name.split(".")[0];
      const ext = file.extension?.toLowerCase();
      setSm(
        `https://s3.us-east-1.wasabisys.com/birdinghotspots/species/${baseName}_small.${ext === "jpeg" ? "jpg" : ext}`
      );
      setMd(
        `https://s3.us-east-1.wasabisys.com/birdinghotspots/species/${baseName}_medium.${ext === "jpeg" ? "jpg" : ext}`
      );
      setLg(
        `https://s3.us-east-1.wasabisys.com/birdinghotspots/species/${baseName}_large.${ext === "jpeg" ? "jpg" : ext}`
      );
      setOriginalUrl(`https://s3.us-east-1.wasabisys.com/birdinghotspots/species/${baseName}_original.${ext}`);
    });

    return instance;
  });

  return (
    <AdminPage title={`Upload Image for ${data.name}`}>
      <div className="container pb-16 my-12">
        <h2 className="text-xl font-bold text-gray-600 border-b pb-4 mb-4">Upload Image for {data.name}</h2>
        <Form form={form} onSubmit={handleSubmit}>
          <div className="max-w-lg space-y-2 mb-4">
            <Field label="Author">
              <Input type="text" name="author" required />
            </Field>
            <Field label="License">
              <Input type="text" name="license" required />
            </Field>
            <Field label="Source">
              <Input type="text" name="source" required />
            </Field>
            {sm && (
              <a href={sm} target="_blank">
                {sm}
              </a>
            )}
          </div>
          <DragDrop uppy={uppy} />
          <StatusBar uppy={uppy} hideUploadButton showProgressDetails />
          <div className="px-4 py-3 bg-gray-100 text-right rounded mt-4">
            <Submit disabled={loading} color="green" className="font-medium">
              Save Species
            </Submit>
          </div>
        </Form>
      </div>
    </AdminPage>
  );
}

export const getServerSideProps = getSecureServerSideProps(async ({ query, res }, token) => {
  const code = query.code as string;

  const data = await getSpeciesByCode(code);
  if (!data) return { notFound: true };

  return {
    props: {
      code,
      data,
    },
  };
});
