/* eslint-disable @next/next/no-img-element */
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Form from "components/Form";
import Submit from "components/Submit";
import Input from "components/Input";
import RadioGroup from "components/RadioGroup";
import AdminPage from "components/AdminPage";
import { SourceInfoT, SpeciesT } from "lib/types";
import Field from "components/Field";
import useToast from "hooks/useToast";
import FormError from "components/FormError";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import Species from "models/Species";
import { useQuery } from "@tanstack/react-query";

const sourceOptions = [
  { label: "eBird", value: "ebird" },
  { label: "iNaturalist", value: "inat" },
];

type Props = {
  code: string;
  data: SpeciesT;
};

type InputT = {
  source: string;
  sourceId: string;
  author: string;
};

export default function Import({ data, code }: Props) {
  const { send, loading } = useToast();
  const form = useForm<InputT>({
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

  const handleSubmit: SubmitHandler<InputT> = async (data) => {
    await send({
      url: `/api/species/${code}/import`,
      method: "POST",
      data: {
        ...data,
        width: sourceInfo?.info.width,
        height: sourceInfo?.info.height,
      },
    });
  };

  return (
    <AdminPage title="Import Image">
      <div className="container pb-16 my-12">
        <Form form={form} onSubmit={handleSubmit}>
          <div className="max-w-2xl mx-auto">
            <div className=" bg-white space-y-6">
              <h2 className="text-xl font-bold text-gray-600 border-b pb-4">{data.name}</h2>
              <RadioGroup label="Source" name="sourceId" options={sourceOptions} />

              <Field label="Source URL">
                <Input type="text" name="source" required />
                <FormError name="source" />
              </Field>

              <Field label="Author">
                <Input type="text" name="author" required />
                <FormError name="author" />
              </Field>

              <img
                src={`https://cdn.download.ams.birds.cornell.edu/api/v2/asset/${source}/2400`}
                className="w-full"
                alt=""
              />
            </div>
            <div className="flex justify-end mt-4">
              <Submit disabled={loading} color="green" className="font-medium">
                Import
              </Submit>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-600 mb-2">Quick Links</h3>
              <ul>
                <li>
                  <a
                    href={`https://media.ebird.org/catalog?sort=upload_date_desc&userId=USER730325&taxonCode=${code}&view=grid`}
                    target="_blank"
                  >
                    Adam&apos;s eBird Media
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </Form>
      </div>
    </AdminPage>
  );
}

export const getServerSideProps = getSecureServerSideProps(async ({ query, res }, token) => {
  const { code } = query;
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
