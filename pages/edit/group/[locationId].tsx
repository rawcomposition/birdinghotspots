import * as React from "react";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import { ParsedUrlQuery } from "querystring";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import Input from "components/Input";
import Textarea from "components/Textarea";
import Form from "components/Form";
import Submit from "components/Submit";
import { getGroupByLocationId, getChildHotspots } from "lib/mongo";
import { geocode, restroomOptions, formatMarkerArray } from "lib/helpers";
import InputLinks from "components/InputLinks";
import Select from "components/Select";
import AdminPage from "components/AdminPage";
import { Group, Hotspot, GroupInputs } from "lib/types";
import Field from "components/Field";
import FormError from "components/FormError";
import useToast from "hooks/useToast";
import ImagesInput from "components/ImagesInput";
import TinyMCE from "components/TinyMCE";
import MapZoomInput from "components/MapZoomInput";
import Error from "next/error";
import HotspotSelect from "components/HotspotSelect";

type Props = {
  id?: string;
  isNew: boolean;
  data: Group;
  error?: string;
  errorCode?: number;
  childLocations: Hotspot[];
};

export default function Edit({ id, isNew, data, childLocations, error, errorCode }: Props) {
  const [isGeocoded, setIsGeocoded] = React.useState(false);
  const { send, loading } = useToast();

  const router = useRouter();
  const form = useForm<GroupInputs>({ defaultValues: data });

  const markers = formatMarkerArray(childLocations);

  const handleSubmit: SubmitHandler<GroupInputs> = async (data) => {
    const response = await send({
      url: `/api/group/${isNew ? "add" : "update"}`,
      method: "POST",
      data: {
        id,
        data: {
          ...data,
          hotspots: data.hotspotSelect.map(({ value }) => value),
        },
      },
    });
    if (response.success) {
      router.push(response.url);
    }
  };

  //@ts-ignore
  const address = form.watch("address");
  //@ts-ignore
  const lat = form.watch("lat");
  //@ts-ignore
  const lng = form.watch("lng");

  const geocodeCoorinates = async (lat: number, lng: number) => {
    if (address) return;
    const { city, state, zip } = await geocode(lat, lng);
    if (city && state && zip) {
      form.setValue("address", `${city}, ${state} ${zip}`);
      setIsGeocoded(true);
    }
  };

  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lat = Number(e.target.value);
    if (lat && lng) {
      geocodeCoorinates(lat, lng);
    }
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lng = Number(e.target.value);
    if (lat && lng) {
      geocodeCoorinates(lat, lng);
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

              <div className="grid grid-cols-2 gap-4">
                <Field label="Latitude">
                  <Input type="text" name="lat" onChange={handleLatChange} />
                </Field>
                <Field label="Longitude">
                  <Input type="text" name="lng" onChange={handleLngChange} />
                </Field>
              </div>

              <Field label="Address">
                <Textarea name="address" rows={2} />
                {isGeocoded && (
                  <small>
                    <span className="text-orange-700">Note</span>: Address is estimated, confirm it is correct.
                  </small>
                )}
              </Field>

              <InputLinks />

              <Field label="Tips for Birding">
                <TinyMCE name="tips" defaultValue={data?.tips} />
              </Field>

              <Field label="Birds of Interest">
                <TinyMCE name="birds" defaultValue={data?.birds} />
              </Field>

              <Field label="About this location">
                <TinyMCE name="about" defaultValue={data?.about} />
              </Field>

              <Field label="Notable Trails">
                <TinyMCE name="hikes" defaultValue={data?.hikes} />
              </Field>

              <Field label="Hotspots">
                <HotspotSelect name="hotspotSelect" className="mt-1 w-full" isMulti />
              </Field>

              <div>
                <label className="text-gray-500 font-bold">Maps</label>
                <ImagesInput hideMapCheckbox />
              </div>

              <div className="px-4 py-3 bg-gray-100 text-right sm:px-6 rounded hidden md:block">
                <Submit disabled={loading} color="green" className="font-medium">
                  Save Group
                </Submit>
              </div>
            </div>

            <aside className="px-4 md:mt-12 pb-5 pt-3 rounded bg-gray-100 md:w-[350px] space-y-6">
              <Field label="Restrooms">
                <Select name="restrooms" options={restroomOptions} isClearable />
              </Field>
              {markers.length > 0 && (
                <div className="flex-1">
                  <label className="text-gray-500 font-bold mb-1 block">Group Map</label>
                  <MapZoomInput markers={markers} />
                </div>
              )}
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

const getChildren = async (id: string) => {
  if (!id) return null;
  const data = await getChildHotspots(id);
  return data || [];
};

export const getServerSideProps = getSecureServerSideProps(async ({ query, res }, token) => {
  const { locationId, country: countryParam } = query as Params;
  const isNew = locationId === "new";

  const data = isNew ? null : await getGroupByLocationId(locationId);
  if (!isNew && !data) return { notFound: true };

  const countryCode = data?.countryCode || (countryParam as string)?.toUpperCase();

  const { role, regions } = token;
  const canEdit =
    isNew || role === "admin" || data?.stateCodes?.filter((it: string) => regions?.includes(it)).length > 0;

  if (!canEdit) {
    res.statusCode = 403;
    return { props: { error: "Access Deneid", errorCode: 403 } };
  }

  const childLocations = data?._id ? await getChildren(data._id) : [];
  const hotspotSelect = data?.hotspots?.map((hotspot: Hotspot) => ({ label: hotspot.name, value: hotspot._id })) || [];

  return {
    props: {
      id: data?._id || null,
      isNew: !data,
      childLocations,
      data: {
        ...data,
        countryCode,
        name: data?.name || "",
        stateCodes: data?.stateCodes || [],
        countyCodes: data?.countyCodes || [],
        zoom: data?.zoom || 12,
        hotspotSelect,
      },
    },
  };
});
