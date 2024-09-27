/* eslint-disable @next/next/no-img-element */
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Form from "components/Form";
import Submit from "components/Submit";
import Input from "components/Input";
import RadioGroup from "components/RadioGroup";
import AdminPage from "components/AdminPage";
import { SourceInfoT, SpeciesT, SpeciesInput, ImgSourceLabel, ImgSource } from "lib/types";
import Field from "components/Field";
import FormError from "components/FormError";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import Species from "models/Species";
import { useQuery } from "@tanstack/react-query";
import InputImageCrop from "components/InputImageCrop";
import SelectiNatSourceId from "components/SelectiNatSourceId";
import connect from "lib/mongo";
import useMutation from "hooks/useMutation";
import SelectLicense from "components/SelectLicense";
import { getSourceUrl } from "lib/species";
import toast from "react-hot-toast";

const sourceOptions = Object.entries(ImgSourceLabel).map(([key, label]) => ({
  label,
  value: key,
}));

type Props = {
  code: string;
  data: SpeciesT;
};

export default function Import({ data, code }: Props) {
  const form = useForm<SpeciesInput>({
    defaultValues: data.hasImg
      ? {
          source: data.source,
          sourceId: data.sourceId,
          author: data.author,
          license: data.license,
          crop: data.crop,
          iNatObsId: data.iNatObsId,
          iNatFileExt: data.iNatFileExt,
        }
      : {
          source: "inat",
        },
  });

  const source = form.watch("source");
  const sourceIdValue = form.watch("sourceId");
  const sourceId = sourceIdValue?.replace("ML", "").trim();
  const iNatObsId = form.watch("iNatObsId")?.trim();
  const iNatFileExt = form.watch("iNatFileExt");

  const { data: sourceInfo, isLoading: isSourceInfoLoading } = useQuery<{ info: SourceInfoT }>({
    refetchInterval: 60000,
    queryKey: ["/api/species/get-source-info", { source, sourceId, iNatObsId }],
    enabled: !!source && (!!sourceId || !!iNatObsId),
    retry: false,
  });

  React.useEffect(() => {
    if (sourceInfo?.info) {
      form.setValue("author", sourceInfo.info.author);
      if (sourceInfo.info.license) {
        form.setValue("license", sourceInfo.info.license);
      }
      if (sourceInfo.info.iNatFileExt) {
        form.setValue("iNatFileExt", sourceInfo.info.iNatFileExt);
      }
      if (sourceInfo.info.sourceIds?.length) {
        form.setValue("sourceId", sourceInfo.info.sourceIds[0]?.toString());
      }
    }
  }, [sourceInfo]);

  React.useEffect(() => {
    if (source === "inat") {
      form.setFocus("iNatObsId");
    } else {
      form.setFocus("sourceId");
    }
  }, [source]);

  const mutation = useMutation({
    url: `/api/species/${code}/update`,
    method: "POST",
    successMessage: "Image imported successfully",
  });

  const handleSubmit: SubmitHandler<SpeciesInput> = async (data) => {
    if (!data.sourceId) {
      toast.error("Please enter a source ID");
      return;
    }

    if (data.source !== "inat") {
      delete data.iNatFileExt;
      delete data.iNatObsId;
    }

    mutation.mutate({ ...data, sourceId: data.sourceId.replace("ML", "").trim() });
  };

  return (
    <AdminPage title="Import Image">
      <div className="container pb-16 my-12">
        <Form form={form} onSubmit={handleSubmit}>
          <div className="max-w-2xl mx-auto">
            <div className=" bg-white space-y-6">
              <h2 className="text-xl font-bold text-gray-600 border-b pb-4">{data.name}</h2>
              {sourceInfo?.info?.speciesName && sourceInfo?.info?.speciesName !== data.name && (
                <div className="bg-amber-50 p-4 rounded-md">
                  <p className="text-sm text-amber-700">
                    The iNaturalist species name is <strong>{sourceInfo?.info?.speciesName}</strong> does not match.
                  </p>
                </div>
              )}
              <RadioGroup
                label="Source"
                name="source"
                options={sourceOptions}
                onChange={() => {
                  form.setValue("sourceId", "");
                }}
              />

              {source === "inat" && (
                <Field label="iNaturalist Observation ID" required>
                  <Input type="text" name="iNatObsId" required />
                  <FormError name="iNatObsId" />
                </Field>
              )}

              {["ebird", "wikipedia"].includes(source) && (
                <Field label={source === "ebird" ? "ML ID" : "Wikipedia Slug"} required>
                  <Input type="text" name="sourceId" required />
                  <FormError name="sourceId" />
                </Field>
              )}

              {source === "inat" && (
                <Field label="iNaturalist Photo" required>
                  <SelectiNatSourceId
                    name="sourceId"
                    sourceIds={sourceInfo?.info.sourceIds || []}
                    isLoading={isSourceInfoLoading}
                    iNatFileExt={iNatFileExt}
                  />
                  <FormError name="sourceId" />
                </Field>
              )}

              <Field label="Author" required>
                <Input type="text" name="author" required />
                <FormError name="author" />
              </Field>

              <Field label="License" required>
                <SelectLicense name="license" required instanceId="license" />
                <FormError name="license" />
              </Field>

              {sourceId && (
                <InputImageCrop
                  name="crop"
                  url={getSourceUrl({ source, sourceId, size: 2400, ext: iNatFileExt }) || ""}
                />
              )}
            </div>
            <div className="flex justify-end mt-4">
              <Submit disabled={mutation.isPending} color="green" className="font-medium">
                Save
              </Submit>
            </div>
          </div>
        </Form>
      </div>
    </AdminPage>
  );
}

export const getServerSideProps = getSecureServerSideProps(async ({ query, res }, token) => {
  const { code } = query;
  await connect();
  const species = await Species.findById(code);

  if (!species) return { notFound: true };

  const cleanSpecies = JSON.parse(JSON.stringify(species));

  return {
    props: {
      data: cleanSpecies,
      code,
    },
  };
});
