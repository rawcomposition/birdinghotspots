import React from "react";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import { ParsedUrlQuery } from "querystring";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import Input from "components/Input";
import Textarea from "components/Textarea";
import Form from "components/Form";
import Submit from "components/Submit";
import { getGroupByLocationId } from "lib/mongo";
import { formatMarker, canEdit } from "lib/helpers";
import InputHotspotLinks from "components/InputHotspotLinks";
import RadioGroup from "components/RadioGroup";
import AdminPage from "components/AdminPage";
import { Group, Hotspot, GroupInputs, Marker } from "lib/types";
import Field from "components/Field";
import FormError from "components/FormError";
import useToast from "hooks/useToast";
import ImagesInput from "components/ImagesInput";
import TinyMCE from "components/TinyMCE";
import Error from "next/error";
import HotspotSelect from "components/HotspotSelect";
import toast from "react-hot-toast";
import InputCitations from "components/InputCitations";
import Checkbox from "components/Checkbox";

type Props = {
  id?: string;
  isNew: boolean;
  markers: Marker[];
  data: Group;
  error?: string;
  errorCode?: number;
};

export default function Edit({ id, isNew, data, markers, error, errorCode }: Props) {
  const { send, loading } = useToast();

  const router = useRouter();
  const form = useForm<GroupInputs>({ defaultValues: data });

  const handleSubmit: SubmitHandler<GroupInputs> = async (data) => {
    if (!data.about) {
      return toast.error('"About this location" is required');
    }
    if (data.hotspotSelect.length === 0) {
      return toast.error("Please select at least one hotspot");
    }
    // @ts-ignore
    if (window.isUploading && !confirm("You have images uploading. Are you sure you want to submit?")) return;
    const response = await send({
      url: `/api/group/${isNew ? "add" : "update"}`,
      method: "POST",
      data: {
        id,
        data: {
          ...data,
          name: data.name.trim(),
          hotspots: data.hotspotSelect.map(({ value }) => value),
        },
      },
    });
    if (response.success) {
      router.push(response.url);
    }
  };

  if (error) return <Error statusCode={errorCode || 500} title={error} />;

  return (
    <AdminPage title="Edit Group">
      <div className="container pb-16 my-12">
        <h2 className="text-xl font-bold text-gray-600 border-b pb-4">{isNew ? "Add" : "Edit"} Group</h2>
        <Form form={form} onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="pt-5 bg-white space-y-6 flex-1">
              <Field label="Name">
                <Input type="text" name="name" required />
                <FormError name="name" />
              </Field>

              <Field label="Address">
                <Textarea
                  name="address"
                  rows={2}
                  help="City, state, and zip is sufficient if a full address is unavailable"
                />
              </Field>

              <div className="space-y-1">
                <Field label="Official Webpage URL">
                  <Input type="url" name="webpage" defaultValue={data?.webpage} placeholder="https://..." />
                </Field>
                <Checkbox name="citeWebpage" label="Include as citation" />
              </div>

              <InputHotspotLinks label="Additional Links" />

              <Field
                label="Tips for Birding"
                help="Where to park, good birding locations, best time of year to visit, whether a scope is helpful, safety concerns, and other information that will help birders know what to expect when they visit the location."
              >
                <TinyMCE name="tips" defaultValue={data?.tips} />
              </Field>

              <Field
                label="Birds of Interest"
                help="List birds that are commonly found here but hard to find at other locations. You can list these by season if there is a variation of birds of interest at different seasons of the year."
              >
                <TinyMCE name="birds" defaultValue={data?.birds} />
              </Field>

              <Field label="About this location (required)" help="This will be displayed on all child hotspots">
                <TinyMCE name="about" defaultValue={data?.about} />
              </Field>

              <Field label="Notable Trails" help="Information on trails that are good for birding.">
                <TinyMCE name="hikes" defaultValue={data?.hikes} />
              </Field>

              <InputCitations />

              <Field label="Hotspots">
                <HotspotSelect name="hotspotSelect" className="mt-1 w-full" isMulti />
              </Field>

              <div>
                <label className="text-gray-500 font-bold">Maps</label>
                <ImagesInput hideMapCheckbox showHideFromChildrenCheckbox />
              </div>

              <div className="px-4 py-3 bg-gray-100 text-right sm:px-6 rounded hidden md:block">
                <Submit disabled={loading} color="green" className="font-medium">
                  Save Group
                </Submit>
              </div>
            </div>

            <aside className="px-4 md:mt-12 pb-5 pt-3 rounded bg-gray-100 md:w-[350px] space-y-6">
              <RadioGroup name="restrooms" label="Restrooms on site" options={["Yes", "No", "Unknown"]} />
            </aside>
          </div>
          <div className="px-4 py-3 bg-gray-100 text-right rounded mt-4 md:hidden">
            <Submit disabled={loading} color="green" className="font-medium">
              Save Group
            </Submit>
          </div>
        </Form>
      </div>
    </AdminPage>
  );
}

interface Params extends ParsedUrlQuery {
  locationId: string;
  country: string;
}

export const getServerSideProps = getSecureServerSideProps(async ({ query, res }, token) => {
  const { locationId, country: countryParam } = query as Params;
  const isNew = locationId === "new";

  const data = isNew ? null : await getGroupByLocationId(locationId);
  if (!isNew && !data) return { notFound: true };

  const countryCode = data?.countryCode || (countryParam as string)?.toUpperCase();

  const { role } = token;
  const canEditGroup =
    isNew || role === "admin" || canEdit(token, !!data?.stateCodes?.length ? data.stateCodes[0] : countryCode);

  if (!canEditGroup) {
    res.statusCode = 403;
    return { props: { error: "Access Deneid", errorCode: 403 } };
  }

  const hotspotSelect = data?.hotspots?.map((hotspot: Hotspot) => ({ label: hotspot.name, value: hotspot._id })) || [];

  const markers = data?.hotspots?.map((it: Hotspot) => formatMarker(it, true)) || [];

  return {
    props: {
      id: data?._id || null,
      isNew: !data,
      markers,
      data: {
        ...data,
        countryCode,
        name: data?.name || "",
        stateCodes: data?.stateCodes || [],
        countyCodes: data?.countyCodes || [],
        hotspotSelect,
        restrooms: data?.restrooms || "Unknown",
      },
    },
  };
});
