import * as React from "react";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import { ParsedUrlQuery } from "querystring";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import Textarea from "components/Textarea";
import Form from "components/Form";
import Submit from "components/Submit";
import { getHotspotByLocationId } from "lib/mongo";
import { geocode, getEbirdHotspot, accessibleOptions, restroomOptions, formatMarker } from "lib/helpers";
import InputLinks from "components/InputLinks";
import InputCitations from "components/InputCitations";
import Select from "components/Select";
import IbaSelect from "components/IbaSelect";
import AdminPage from "components/AdminPage";
import { Hotspot, EbirdHotspot, Link, Group, Image } from "lib/types";
import RadioGroup from "components/RadioGroup";
import CheckboxGroup from "components/CheckboxGroup";
import Field from "components/Field";
import useToast from "hooks/useToast";
import Error from "next/error";
import ImagesInput from "components/ImagesInput";
import TinyMCE from "components/TinyMCE";
import MapZoomInput from "components/MapZoomInput";
import LicenseNotice from "components/LicenseNotice";
import MapGrid from "components/MapGrid";
import ExpandableHtml from "components/ExpandableHtml";

type GroupAbout = {
  title: string;
  text: string;
};

type Props = {
  id?: string;
  isNew: boolean;
  groupLinks: Link[];
  groupImages: Image[];
  groupAbout: GroupAbout[];
  data: Hotspot;
  error?: string;
  errorCode?: number;
};

export default function Edit({ id, isNew, groupLinks, groupImages, groupAbout, data, error, errorCode }: Props) {
  const [isGeocoded, setIsGeocoded] = React.useState(false);
  const { send, loading } = useToast();

  const router = useRouter();
  const form = useForm<Hotspot>({ defaultValues: data });
  const isOH = data?.stateCode === "US-OH";

  //@ts-ignore
  const latValue = form.watch("lat");
  const lngValue = form.watch("lng");
  const markers = [formatMarker({ ...data, lat: latValue, lng: lngValue })];

  const handleSubmit: SubmitHandler<Hotspot> = async (data) => {
    // @ts-ignore
    if (window.isUploading && !confirm("You have images uploading. Are you sure you want to submit?")) return;
    const response = await send({
      url: `/api/hotspot/${isNew ? "add" : "update"}`,
      method: "POST",
      data: {
        id,
        data: {
          ...data,
          about: data.about || "",
          tips: data.tips || "",
          birds: data.birds || "",
          hikes: data.hikes || "",
          iba: data.iba || null,
          restrooms: data.restrooms || null,
          accessible: data.accessible && data.accessible?.length > 0 ? data.accessible : null,
        },
      },
    });
    if (response.success) {
      router.push(response.url);
    }
  };

  const { address, lat, lng } = data || {};

  React.useEffect(() => {
    const geocodeAddress = async () => {
      const { city, state, zip } = await geocode(lat, lng);
      if (city && state && zip) {
        //@ts-ignore
        form.setValue("address", `${city}, ${state} ${zip}`);
        setIsGeocoded(true);
      }
    };
    if (!lat || !lng) return;
    if (isNew || !data?.address) geocodeAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, lat, lng]);

  if (error) return <Error statusCode={errorCode || 500} title={error} />;

  return (
    <AdminPage title="Edit Hotspot">
      <div className="container pb-16 my-12">
        <h2 className="text-xl font-bold text-gray-600 border-b pb-4">{data?.name}</h2>
        <Form form={form} onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="pt-5 bg-white space-y-6 flex-1">
              <Field label="Address">
                <Textarea name="address" rows={2} />
                {isGeocoded && (
                  <small>
                    <span className="text-orange-700">Note</span>: Address is estimated, confirm it is correct.
                  </small>
                )}
              </Field>

              {groupLinks.length > 0 && (
                <div className="bg-gray-100 px-3 py-2 rounded-md">
                  <h4 className="text-gray-500 font-bold">Group Links</h4>
                  {groupLinks.map(({ label, url }) => (
                    <>
                      <a href={url} key={url} target="_blank" rel="noopener noreferrer">
                        {label}
                      </a>
                      <br />
                    </>
                  ))}
                </div>
              )}

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

              {groupAbout?.map(({ title, text }, i) => (
                <div key={i} className="bg-gray-100 px-3 py-2 rounded-md">
                  <h4 className="text-gray-500 font-bold">
                    {title} <span className="text-xs text-gray-400">(from group page)</span>
                  </h4>
                  <ExpandableHtml html={text} className="formatted" isGray />
                </div>
              ))}

              {groupImages.length > 0 && <MapGrid images={groupImages} />}

              <div>
                <label className="text-gray-500 font-bold">Images</label>
                <ImagesInput enableStreetview />
                <LicenseNotice />
              </div>

              <div className="px-4 py-3 bg-gray-100 text-right sm:px-6 rounded hidden md:block">
                <Submit disabled={loading} color="green" className="font-medium">
                  Save Hotspot
                </Submit>
              </div>
            </div>
            <aside className="px-4 md:mt-12 pb-5 pt-3 rounded bg-gray-100 md:w-[350px] space-y-6">
              <Field label="Restrooms">
                <Select name="restrooms" options={restroomOptions} isClearable />
              </Field>
              {isOH && (
                <Field label="Important Bird Area">
                  <IbaSelect name="iba" isClearable />
                </Field>
              )}
              <CheckboxGroup name="accessible" label="Accessible Facilities" options={accessibleOptions} />
              <RadioGroup name="roadside" label="Roadside accessible" options={["Yes", "No", "Unknown"]} />
              {markers.length > 0 && (
                <div className="flex-1">
                  <label className="text-gray-500 font-bold mb-1 block">Hotspot Map</label>
                  {/*@ts-ignore*/}
                  <MapZoomInput markers={markers} />
                </div>
              )}
            </aside>
          </div>
          <div className="px-4 py-3 bg-gray-100 text-right rounded mt-4 md:hidden">
            <Submit disabled={loading} color="green" className="font-medium">
              Save Hotspot
            </Submit>
          </div>
        </Form>
      </div>
    </AdminPage>
  );
}

interface Params extends ParsedUrlQuery {
  locationId: string;
}

export const getServerSideProps = getSecureServerSideProps(async ({ query, res }, token) => {
  const { locationId } = query as Params;
  const data = await getHotspotByLocationId(locationId, true);
  const ebirdData: EbirdHotspot = await getEbirdHotspot(locationId);
  if (!ebirdData?.name) {
    res.statusCode = 404;
    return {
      props: { error: `Hotspot "${locationId}" not found in eBird`, errorCode: 404 },
    };
  }

  const stateCode = data?.stateCode || ebirdData?.subnational1Code;
  const countyCode = data?.countyCode || ebirdData?.subnational2Code;

  const { role, regions } = token;
  if (role !== "admin" && !regions.includes(stateCode)) {
    res.statusCode = 403;
    return { props: { error: "Access Deneid", errorCode: 403 } };
  }

  const groupLinks: Link[] = [];
  data?.groups?.forEach(({ links }: Group) => {
    if (links) groupLinks.push(...links);
  });

  const groupImages: Image[] = [];
  data?.groups?.forEach(({ images }: Group) => {
    if (!images) return;
    const filtered = images.filter((it) => !it.hideFromChildren);
    groupImages.push(...filtered);
  });

  const groupAbout: GroupAbout[] = [];
  data?.groups?.forEach(({ name, about }: Group) => {
    if (about)
      groupAbout.push({
        title: `About ${name}`,
        text: about,
      });
  });

  return {
    props: {
      id: data?._id || null,
      isNew: !data,
      groupLinks,
      groupImages,
      groupAbout,
      data: {
        ...data,
        iba: data?.iba || null,
        links: data?.links || null,
        name: ebirdData?.name || data?.name,
        lat: ebirdData?.latitude || data?.lat,
        lng: ebirdData?.longitude || data?.lng,
        zoom: data?.zoom || 14,
        countryCode: ebirdData?.subnational1Code?.split("-")?.[0] || data?.countryCode,
        stateCode,
        countyCode,
        locationId: locationId,
        roadside: data?.roadside || "Unknown",
        restrooms: data?.restrooms || null,
        accessible: data?.accessible || null,
      },
    },
  };
});
