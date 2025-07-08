import React from "react";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import { ParsedUrlQuery } from "querystring";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import Textarea from "components/Textarea";
import Form from "components/Form";
import Submit from "components/Submit";
import { getHotspotByLocationId } from "lib/mongo";
import { geocode, formatMarker, canEdit, getEbirdHotspot, generateRandomId } from "lib/helpers";
import InputHotspotLinks from "components/InputHotspotLinks";
import InputCitations from "components/InputCitations";
import IbaSelect from "components/IbaSelect";
import AdminPage from "components/AdminPage";
import { Link, Citation, Group, Image, MlImage, HotspotInput } from "lib/types";
import RadioGroup from "components/RadioGroup";
import Field from "components/Field";
import useToast from "hooks/useToast";
import Error from "next/error";
import ImagesInput from "components/ImagesInput";
import TinyMCE from "components/TinyMCE";
import MapZoomInput from "components/MapZoomInput";
import MapGrid from "components/MapGrid";
import ExpandableHtml from "components/ExpandableHtml";
import Input from "components/Input";
import Checkbox from "components/Checkbox";
import useConfirmNavigation from "hooks/useConfirmNavigation";
import InputFeaturedImages from "components/InputFeaturedImages";
import useAvailableImgCount from "hooks/useAvailableImgCount";
import Badge from "components/Badge";
import dynamic from "next/dynamic";
import { PLAN_SECTION_HELP_TEXT, BIRDING_SECTION_HELP_TEXT, ABOUT_SECTION_HELP_TEXT } from "lib/config";
const NewSectionsBanner = dynamic(() => import("components/NewSectionsBanner"), { ssr: false });

type GroupAbout = {
  title: string;
  text: string;
};

type Props = {
  id?: string;
  isNew: boolean;
  groupLinks: Link[];
  groupCitations: Citation[];
  groupImages: Image[];
  groupAbout: GroupAbout[];
  data: HotspotInput;
  error?: string;
  errorCode?: number;
};

export default function Edit({
  id,
  isNew,
  groupLinks,
  groupCitations,
  groupImages,
  groupAbout,
  data,
  error,
  errorCode,
}: Props) {
  const [isGeocoded, setIsGeocoded] = React.useState(false);
  const { send, loading } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const form = useForm<HotspotInput>({ defaultValues: data });
  const isOH = data?.stateCode === "US-OH";
  useConfirmNavigation(form.formState.isDirty && !isSubmitting);
  const { count: availableImgCount } = useAvailableImgCount(data.locationId);

  //@ts-ignore
  const latValue = form.watch("lat");
  const lngValue = form.watch("lng");
  const markers = [formatMarker({ ...data, lat: latValue, lng: lngValue })];

  const handleSubmit: SubmitHandler<HotspotInput> = async ({ featuredImages, ...data }) => {
    setIsSubmitting(true);

    const filteredFeaturedImages = featuredImages.filter((it) => it.data);

    const response = await send({
      url: `/api/hotspot/${isNew ? "add" : "update"}`,
      method: "POST",
      data: {
        id,
        data: {
          ...data,
          featuredImg1: filteredFeaturedImages[0]?.data || null,
          featuredImg2: filteredFeaturedImages[1]?.data || null,
          featuredImg3: filteredFeaturedImages[2]?.data || null,
          featuredImg4: filteredFeaturedImages[3]?.data || null,
          plan: data.plan || "",
          birding: data.birding || "",
          about: data.about || "",
          iba: data.iba || null,
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
              <Field label="Address" help="City, state, and zip is sufficient if a full address is unavailable">
                <Textarea name="address" rows={2} />
                {isGeocoded && (
                  <small>
                    <span className="text-orange-700">Note</span>: Address is estimated, confirm it is correct.
                  </small>
                )}
              </Field>

              <div className="space-y-1">
                <Field label="Official Webpage URL">
                  <Input type="url" name="webpage" defaultValue={data?.webpage} placeholder="https://..." />
                </Field>
                <Checkbox name="citeWebpage" label="Include as citation" />
              </div>

              <div className="space-y-1">
                <Field
                  label="Trail Map URL"
                  help="Provide a link to a document, image, or webpage that contains a map of the trails at this location."
                >
                  <Input type="url" name="trailMap" defaultValue={data?.trailMap} placeholder="https://..." />
                </Field>
              </div>

              <InputHotspotLinks label="Additional Links" groupLinks={groupLinks} />

              <NewSectionsBanner />

              <Field label="Plan Your Visit" help={PLAN_SECTION_HELP_TEXT}>
                <TinyMCE name="plan" defaultValue={data?.plan} />
              </Field>

              <Field label="How to Bird Here" help={BIRDING_SECTION_HELP_TEXT}>
                <TinyMCE name="birding" defaultValue={data?.birding} />
              </Field>

              <Field label="About this location" help={ABOUT_SECTION_HELP_TEXT}>
                <TinyMCE name="about" defaultValue={data?.about} />
              </Field>

              <InputCitations groupLinks={groupLinks} groupCitations={groupCitations} />

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
                <div className="flex items-center justify-between">
                  <label className="text-gray-500 font-bold">Featured eBird Images</label>
                  <Badge>Available: {availableImgCount}</Badge>
                </div>
                <InputFeaturedImages locationId={data.locationId} />
              </div>

              <div>
                <label className="text-gray-500 font-bold">Legacy Images</label>
                <ImagesInput enableStreetview />
              </div>

              <div className="px-4 py-3 bg-gray-100 text-right sm:px-6 rounded hidden md:block">
                <Submit disabled={loading} color="green" className="font-medium">
                  Save Hotspot
                </Submit>
              </div>
            </div>
            <aside className="px-4 md:mt-12 pb-5 pt-3 rounded bg-gray-100 md:w-[350px] space-y-6">
              {isOH && (
                <Field label="Important Bird Area">
                  <IbaSelect name="iba" isClearable />
                </Field>
              )}
              <RadioGroup name="restrooms" label="Restrooms on site" options={["Yes", "No", "Unknown"]} />
              <RadioGroup
                name="accessible"
                help="Is there a wheelchair accessible trail at this location?"
                label="Wheelchair accessible trail"
                options={["Yes", "No", "Unknown"]}
              />
              <RadioGroup
                name="roadside"
                label="Roadside viewing"
                help="Is this a location where birders can watch from a vehicle?"
                options={["Yes", "No", "Unknown"]}
              />
              <RadioGroup name="fee" label="Entrance fee" options={["Yes", "No", "Unknown"]} />
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
  const [data, ebirdHotspot] = await Promise.all([
    getHotspotByLocationId(locationId, true),
    getEbirdHotspot(locationId),
  ]);

  if (!data) {
    res.statusCode = 404;
    return { props: { error: "Not Found", errorCode: 404 } };
  }

  const countryCode = data.countryCode;
  const stateCode = data.stateCode || null;
  const countyCode = data.countyCode;

  if (!canEdit(token, stateCode || countryCode)) {
    res.statusCode = 403;
    return { props: { error: "Access Deneid", errorCode: 403 } };
  }

  const groupLinks: Link[] = [];
  data.groups?.forEach(({ links }: Group) => {
    if (links) groupLinks.push(...links);
  });

  const groupCitations: Citation[] = [];
  data.groups?.forEach(({ citations }: Group) => {
    if (citations) groupCitations.push(...citations);
  });

  const groupImages: Image[] = [];
  data.groups?.forEach(({ images }: Group) => {
    if (!images) return;
    const filtered = images.filter((it) => !it.hideFromChildren);
    groupImages.push(...filtered);
  });

  const groupAbout: GroupAbout[] = [];
  data.groups?.forEach(({ name, about }: Group) => {
    if (about)
      groupAbout.push({
        title: `About ${name}`,
        text: about,
      });
  });

  const featuredImages: { id: string; data: MlImage | null }[] = [
    { id: generateRandomId(6), data: data.featuredImg1 || null },
    { id: generateRandomId(6), data: data.featuredImg2 || null },
    { id: generateRandomId(6), data: data.featuredImg3 || null },
    { id: generateRandomId(6), data: data.featuredImg4 || null },
  ];

  return {
    props: {
      id: data._id || null,
      isNew: !data,
      groupLinks,
      groupCitations,
      groupImages,
      groupAbout,
      data: {
        featuredImages,
        ...data,
        iba: data.iba || null,
        links: data.links || null,
        name: ebirdHotspot?.name || data.name,
        lat: ebirdHotspot?.lat || data.lat,
        lng: ebirdHotspot?.lng || data.lng,
        zoom: data.zoom || 14,
        countryCode,
        ...(stateCode && { stateCode }),
        ...(countyCode && { countyCode }),
        locationId: locationId,
        roadside: data.roadside || "Unknown",
        restrooms: data.restrooms || "Unknown",
        accessible: data.accessible || "Unknown",
        fee: data.fee || "Unknown",
      },
    },
  };
});
