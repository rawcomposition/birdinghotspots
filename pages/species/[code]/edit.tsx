/* eslint-disable @next/next/no-img-element */
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Form from "components/Form";
import Submit from "components/Submit";
import Input from "components/Input";
import RadioGroup from "components/RadioGroup";
import AdminPage from "components/AdminPage";
import { SourceInfoT, SpeciesT, SpeciesInput, ImgSourceLabel, License } from "lib/types";
import { LicenseLabel } from "lib/types";
import Field from "components/Field";
import FormError from "components/FormError";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import Species from "models/Species";
import { useQuery } from "@tanstack/react-query";
import InputImageCrop from "components/InputImageCrop";
import SelectiNatSourceId from "components/SelectiNatSourceId";
import connect from "lib/mongo";
import useMutation from "hooks/useMutation";
import { getSourceImgUrl, getSourceUrl } from "lib/species";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import Checkbox from "components/Checkbox";
import Link from "next/link";

const sourceOptions = Object.entries(ImgSourceLabel).map(([key, label]) => ({
  label,
  value: key,
}));

type Props = {
  code: string;
  data: SpeciesT;
  nextCode: string | null;
  nextName: string | null;
  prevCode: string | null;
  prevName: string | null;
};

export default function Import({ data, code, nextCode, nextName, prevCode, prevName }: Props) {
  const router = useRouter();

  const form = useForm<SpeciesInput>({
    defaultValues: data.hasImg
      ? {
          source: data.source,
          sourceId: data.sourceId,
          author: data.author,
          license: data.license,
          licenseVer: data.licenseVer,
          crop: data.crop,
          iNatObsId: data.iNatObsId,
          iNatFileExt: data.iNatFileExt,
          flip: data.flip,
        }
      : {
          source: "inat",
        },
  });

  const source = form.watch("source");
  const sourceIdValue = form.watch("sourceId");
  const sourceId = sourceIdValue?.replace("ML", "")?.trim();
  const iNatObsId = form.watch("iNatObsId")?.replace("https://www.inaturalist.org/observations/", "")?.trim();
  const sourceUrl = sourceId ? getSourceUrl(source, sourceId, iNatObsId) : null;

  const { data: sourceInfo, isLoading: isSourceInfoLoading } = useQuery<{ info: SourceInfoT }>({
    queryKey: ["/api/species/get-source-info", { source, sourceId, iNatObsId }],
    enabled: !!source && (!!sourceId || !!iNatObsId),
    retry: false,
  });

  const iNatFileExts = sourceInfo?.info.iNatFileExts;
  const iNatSourceIdIndex = sourceInfo?.info?.sourceIds?.findIndex((id) => id === sourceIdValue);
  const iNatFileExt = iNatFileExts?.[iNatSourceIdIndex || 0];

  React.useEffect(() => {
    if (sourceInfo?.info) {
      const values = form.getValues();
      if (!values.author) {
        form.setValue("author", sourceInfo.info.author);
      }
      if (sourceInfo.info.license && !values.license) {
        form.setValue("license", sourceInfo.info.license);
      }
      if (sourceInfo.info.licenseVer && !values.licenseVer) {
        form.setValue("licenseVer", sourceInfo.info.licenseVer);
      }
      if (sourceInfo.info.iNatFileExts && !values.iNatFileExt) {
        form.setValue("iNatFileExt", sourceInfo.info.iNatFileExts[0]);
      }
      if (sourceInfo.info.sourceIds?.length && !values.sourceId) {
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
  });

  const removeMutation = useMutation({
    url: `/api/species/${code}/reset`,
    method: "DELETE",
    onSuccess: () => {
      router.reload();
    },
  });

  const handleSubmit: SubmitHandler<SpeciesInput> = async (data) => {
    if (!data.sourceId) {
      toast.error("Please enter a source ID");
      return;
    }

    if (data.source === "inat") {
      delete data.licenseVer;
    } else {
      delete data.iNatFileExt;
      delete data.iNatObsId;
    }

    if (!Object.keys(LicenseLabel).includes(data.license) && data.source === "inat") {
      toast.error("Please select a valid license");
      return;
    }

    mutation.mutate({
      ...data,
      sourceId: data.sourceId.replace("ML", "").trim(),
      iNatObsId:
        data.source === "inat"
          ? data.iNatObsId?.replace("https://www.inaturalist.org/observations/", "").trim()
          : undefined,
      iNatFileExt: data.source === "inat" ? iNatFileExt : undefined,
    });
  };

  const handleRemove = () => {
    if (!confirm("Are you sure you want to remove the image?")) return;
    removeMutation.mutate({});
  };

  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "f" || event.key === "F") {
        form.setValue("flip", !form.getValues("flip"));
      } else if (event.key === "Enter") {
        event.preventDefault();
        form.handleSubmit(handleSubmit)();
      } else if (event.key === "i" || event.key === "I") {
        if (!(document.activeElement instanceof HTMLInputElement)) {
          event.preventDefault();
          form.setValue("source", "inat");
          form.setValue("sourceId", "");
          form.setValue("iNatObsId", "");
          form.setValue("license", "" as License);
          form.setValue("licenseVer", "");
          form.setValue("author", "");
        }
      } else if (event.key === "ArrowRight" && nextCode) {
        window.location.href = `/species/${nextCode}/edit`;
      } else if (event.key === "ArrowLeft" && prevCode) {
        window.location.href = `/species/${prevCode}/edit`;
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [form, iNatFileExt, nextCode, prevCode]);

  return (
    <>
      {nextCode && (
        <div className="flex pb-16 mt-4 mx-4">
          {prevCode && (
            <a href={`/species/${prevCode}/edit`} className="text-sky-600 hover:text-sky-700 font-semibold mr-auto">
              &larr; {prevName}
            </a>
          )}
          {nextCode && (
            <a href={`/species/${nextCode}/edit`} className="text-sky-600 hover:text-sky-700 font-semibold ml-auto">
              {nextName} &rarr;
            </a>
          )}
        </div>
      )}
      <AdminPage title="Edit Image">
        <div className="container pb-16 my-12">
          <Form form={form} onSubmit={handleSubmit}>
            <div className="max-w-2xl mx-auto">
              <div className=" bg-white space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-600 mb-1">{data.name}</h2>
                  <h3 className="text-md text-gray-500 italic">{data.sciName}</h3>
                  <div className="flex gap-4 border-b pb-2.5 mt-1">
                    <Link
                      className="text-sky-600 hover:text-sky-700 font-semibold"
                      href={`https://www.google.com/search?q=${data?.name}`}
                      target="_blank"
                    >
                      Google
                    </Link>
                    <Link
                      className="text-sky-600 hover:text-sky-700 font-semibold"
                      href={`https://ebird.org/species/${data?._id}`}
                      target="_blank"
                    >
                      eBird
                    </Link>
                    <Link
                      className="text-sky-600 hover:text-sky-700 font-semibold"
                      href={`https://www.flickr.com/search/?text=${data?.name}&license=2%2C3%2C4%2C5%2C6%2C9`}
                      target="_blank"
                    >
                      Flickr
                    </Link>
                    <Link
                      className="text-sky-600 hover:text-sky-700 font-semibold"
                      href={`https://commons.wikimedia.org/w/index.php?search=${data?.sciName}&title=Special:MediaSearch&go=Go&type=image`}
                      target="_blank"
                    >
                      Wikipedia
                    </Link>
                    <button
                      type="button"
                      className="text-sky-600 hover:text-sky-700 font-semibold"
                      onClick={() => {
                        open(
                          `https://www.inaturalist.org/observations?q=${data?.sciName}&photo_license=cc0,cc-by-nc-sa,cc-by-sa,cc-by-nc,cc-by`,
                          "_blank"
                        );
                        open(
                          `https://www.inaturalist.org/observations?q=${data?.sciName}&photo_license=cc0,cc-by-nc-sa,cc-by-sa,cc-by-nc,cc-by&order_by=votes`,
                          "_blank"
                        );
                        open(`https://www.inaturalist.org/taxa/${data?.sciName}`, "_blank");
                      }}
                    >
                      iNat CC
                    </button>
                  </div>
                </div>
                <RadioGroup
                  label="Source"
                  name="source"
                  options={sourceOptions}
                  onChange={() => {
                    form.setValue("sourceId", "");
                    form.setValue("iNatObsId", "");
                    form.setValue("license", "" as License);
                    form.setValue("licenseVer", "");
                    form.setValue("author", "");
                  }}
                />

                {source === "inat" && (
                  <Field label="iNaturalist Observation ID" required>
                    <Input type="text" name="iNatObsId" required />
                    <FormError name="iNatObsId" />
                  </Field>
                )}

                {["ebird", "wikipedia", "flickr"].includes(source) && (
                  <Field
                    label={source === "ebird" ? "ML ID" : source === "wikipedia" ? "Wikipedia Path" : "Flickr Path"}
                    required
                  >
                    <Input type="text" name="sourceId" required />
                    <FormError name="sourceId" />
                    {sourceUrl && (
                      <a href={sourceUrl} target="_blank" className="text-xs text-blue-500 font-semibold">
                        View on {ImgSourceLabel[source]}
                      </a>
                    )}
                  </Field>
                )}

                {source === "inat" && (
                  <Field label="iNaturalist Photo" required>
                    <SelectiNatSourceId
                      name="sourceId"
                      sourceIds={sourceInfo?.info.sourceIds || []}
                      isLoading={isSourceInfoLoading}
                      iNatFileExts={iNatFileExts}
                    />
                    <FormError name="sourceId" />
                    {sourceUrl && (
                      <a href={sourceUrl} target="_blank" className="text-xs text-blue-500 font-semibold">
                        View on iNaturalist
                      </a>
                    )}
                  </Field>
                )}

                <Field label="Author" required>
                  <Input type="text" name="author" />
                  <FormError name="author" />
                </Field>

                <div className={source !== "inat" ? "flex flex-col sm:flex-row items-center gap-2" : ""}>
                  <Field label="License" required>
                    <Input type="text" name="license" />

                    <FormError name="license" />
                  </Field>

                  {source !== "inat" && (
                    <Field label="License Version">
                      <Input type="text" name="licenseVer" />
                      <FormError name="licenseVer" />
                    </Field>
                  )}
                </div>

                <InputImageCrop
                  name="crop"
                  url={
                    sourceId && (source === "inat" ? !!iNatFileExt : true)
                      ? getSourceImgUrl({ source, sourceId, size: 2400, ext: iNatFileExt }) || ""
                      : ""
                  }
                />

                {sourceInfo?.info?.speciesName && sourceInfo?.info?.speciesName !== data.sciName && (
                  <div className="bg-amber-50 p-4 rounded-md">
                    <p className="text-sm text-amber-700">
                      The iNaturalist scientific name <strong>{sourceInfo?.info?.speciesName}</strong> does not match{" "}
                      <strong>{data.sciName}</strong>.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-4 mt-6 items-center">
                <button
                  type="button"
                  onClick={handleRemove}
                  className="font-medium mr-auto text-red-700 rounded-md border border-red-700 px-3 py-1.5 opacity-70 hover:opacity-100"
                  disabled={mutation.isPending}
                >
                  Remove Image
                </button>
                <Checkbox name="flip" label="Flip Image" />
                <Submit disabled={mutation.isPending} color="green" className="font-medium">
                  Save
                </Submit>
              </div>
            </div>
          </Form>
        </div>
      </AdminPage>
    </>
  );
}

export const getServerSideProps = getSecureServerSideProps(async ({ query, res }, token) => {
  const { code } = query;
  await connect();
  const species = await Species.findById(code);

  const [nextSpecies, prevSpecies] = await Promise.all([
    species?.order
      ? await Species.findOne({ order: { $gt: species.order }, crop: { $exists: false }, hasImg: true }).sort({
          order: 1,
        })
      : null,
    species?.order
      ? await Species.findOne({ order: { $lt: species.order }, crop: { $exists: false }, hasImg: true }).sort({
          order: -1,
        })
      : null,
  ]);

  if (!species) return { notFound: true };

  const cleanSpecies = JSON.parse(JSON.stringify(species));

  return {
    props: {
      data: cleanSpecies,
      code,
      nextCode: nextSpecies?._id,
      nextName: nextSpecies?.name,
      prevCode: prevSpecies?._id,
      prevName: prevSpecies?.name,
    },
  };
});
