import getSecureServerSideProps from "lib/getSecureServerSideProps";
import { ParsedUrlQuery } from "querystring";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import InputDrives from "components/InputDrives";
import Form from "components/Form";
import Submit from "components/Submit";
import Input from "components/Input";
import CountySelect from "components/CountySelect";
import { getDriveById } from "lib/mongo";
import AdminPage from "components/AdminPage";
import { Drive, DriveInputs, Region } from "lib/types";
import Field from "components/Field";
import useToast from "hooks/useToast";
import FormError from "components/FormError";
import { getRegion } from "lib/localData";
import { slugify, canEdit } from "lib/helpers";
import TinyMCE from "components/TinyMCE";
import ImagesInput from "components/ImagesInput";
import Error from "next/error";

type Props = {
  id?: string;
  region: Region;
  isNew: boolean;
  data: Drive;
  error?: string;
  errorCode?: number;
};

export default function Edit({ isNew, data, id, region, error, errorCode }: Props) {
  const { send, loading } = useToast();

  const router = useRouter();
  const form = useForm<DriveInputs>({ defaultValues: data });

  const handleSubmit: SubmitHandler<DriveInputs> = async (data) => {
    // @ts-ignore
    if (window.isUploading && !confirm("You have images uploading. Are you sure you want to submit?")) return;
    const newSlug = slugify(data.name);

    const response = await send({
      url: `/api/drive/set?isNew=${isNew}`,
      method: "POST",
      data: {
        id,
        data: {
          ...data,
          stateCode: region.code,
          countryCode: region.code.split("-")[0],
          slug: newSlug,
          entries: data.entries.map(({ hotspotSelect, ...it }) => ({ ...it, hotspot: hotspotSelect.value })),
        },
      },
    });
    if (response.success) {
      router.push(`/region/${region.code}/drives/${newSlug}`);
    }
  };

  if (error) return <Error statusCode={errorCode || 500} title={error} />;

  return (
    <AdminPage title={`${isNew ? "Add" : "Edit"} Drive`}>
      <div className="container pb-16 my-12">
        <Form form={form} onSubmit={handleSubmit}>
          <div className="max-w-2xl mx-auto">
            <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
              <h2 className="text-xl font-bold text-gray-600 border-b pb-4">{isNew ? "Add" : "Edit"} Drive</h2>
              <Field label="Name">
                <Input type="text" name="name" required />
                <FormError name="name" />
              </Field>
              <Field label="Description">
                <TinyMCE name="description" defaultValue={data?.description} />
                <FormError name="description" />
              </Field>
              <Field label="Google Map ID">
                <Input type="text" name="mapId" required />
                <FormError name="mapId" />
              </Field>
              <Field label="Counties">
                <CountySelect name="counties" stateCode={region.code} isMulti required />
                <FormError name="counties" />
              </Field>
              <div>
                <label className="text-gray-500 font-bold">Images</label>
                <ImagesInput hideExtraFields />
              </div>
              <InputDrives stateCode={region.code} />
            </div>
            <div className="px-4 py-3 bg-gray-100 text-right sm:px-6 rounded">
              <Submit disabled={loading} color="green" className="font-medium">
                Save Drive
              </Submit>
            </div>
          </div>
        </Form>
      </div>
    </AdminPage>
  );
}

interface Params extends ParsedUrlQuery {
  id: string;
  region: string;
}

export const getServerSideProps = getSecureServerSideProps(async ({ query, res }, token) => {
  const { id, region: regionCode } = query as Params;
  const data: Drive = id !== "new" ? await getDriveById(id) : null;

  const region = getRegion(regionCode);
  const isState = region?.code?.split("-").length === 2;
  if (!region || !isState) return { notFound: true };

  if (!canEdit(token, region.code)) {
    res.statusCode = 403;
    return { props: { error: "Access Deneid", errorCode: 403 } };
  }

  const entries =
    data?.entries?.map((entry) => ({
      ...entry,
      hotspotSelect: { label: entry.hotspot.name, value: entry.hotspot._id },
    })) ?? [];
  return {
    props: {
      id: data?._id || null,
      region,
      isNew: !data,
      data: { ...data, entries, counties: data?.counties || [] },
    },
  };
});
