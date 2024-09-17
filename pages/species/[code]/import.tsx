/* eslint-disable @next/next/no-img-element */
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Form from "components/Form";
import Submit from "components/Submit";
import Input from "components/Input";
import RadioGroup from "components/RadioGroup";
import AdminPage from "components/AdminPage";
import { SourceInfoT, SpeciesT, SpeciesInput, ImgSourceLabel } from "lib/types";
import Field from "components/Field";
import FormError from "components/FormError";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import Species from "models/Species";
import { useQuery } from "@tanstack/react-query";
import InputImageCrop from "components/InputImageCrop";
import connect from "lib/mongo";
import useMutation from "hooks/useMutation";
import SelectLicense from "components/SelectLicense";
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
    defaultValues: {
      sourceId: "ebird",
    },
  });

  const sourceValue = form.watch("source");
  const source = sourceValue?.replace("ML", "").trim();
  const sourceId = form.watch("sourceId");

  const { data: sourceInfo } = useQuery<{ info: SourceInfoT }>({
    refetchInterval: 60000,
    queryKey: ["/api/species/get-source-info", { source, sourceId }],
    enabled: !!source && !!sourceId,
  });

  React.useEffect(() => {
    if (sourceInfo?.info) {
      form.setValue("author", sourceInfo.info.author);
    }
  }, [sourceInfo]);

  const mutation = useMutation({
    url: `/api/species/${code}/update`,
    method: "POST",
    successMessage: "Image imported successfully",
  });

  const handleSubmit: SubmitHandler<SpeciesInput> = async (data) => {
    mutation.mutate(data);
  };

  return (
    <AdminPage title="Import Image">
      <div className="container pb-16 my-12">
        <Form form={form} onSubmit={handleSubmit}>
          <div className="max-w-2xl mx-auto">
            <div className=" bg-white space-y-6">
              <h2 className="text-xl font-bold text-gray-600 border-b pb-4">{data.name}</h2>
              <RadioGroup label="Source" name="source" options={sourceOptions} />

              <Field label="Source URL">
                <Input type="text" name="sourceId" required />
                <FormError name="sourceId" />
              </Field>

              <Field label="Author">
                <Input type="text" name="author" required />
                <FormError name="author" />
              </Field>

              <Field label="License">
                <SelectLicense name="license" required />
                <FormError name="license" />
              </Field>

              {source && (
                <InputImageCrop
                  name="crop"
                  url={`https://cdn.download.ams.birds.cornell.edu/api/v2/asset/${source}/2400`}
                />
              )}
            </div>
            <div className="flex justify-end mt-4">
              <Submit disabled={mutation.isPending} color="green" className="font-medium">
                Import
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
