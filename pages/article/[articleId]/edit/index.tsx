import * as React from "react";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import Form from "components/Form";
import Submit from "components/Submit";
import Input from "components/Input";
import { getArticleByArticleId } from "lib/mongo";
import AdminPage from "components/AdminPage";
import { Article, ArticleInputs, Region } from "lib/types";
import Field from "components/Field";
import useToast from "hooks/useToast";
import FormError from "components/FormError";
import { getRegion } from "lib/localData";
import { canEdit } from "lib/helpers";
import TinyMCE from "components/TinyMCE";
import ImagesInput from "components/ImagesInput";
import HotspotSelect from "components/HotspotSelect";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import Error from "next/error";

const tinyConfig = {
  menubar: false,
  browser_spellcheck: true,
  plugins: "link autoresize code lists",
  toolbar: "h3 bold italic underline bullist | alignleft aligncenter | removeformat link code",
  content_style:
    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px } cite { font-size: 0.75em; font-style: normal; color: #666; } .two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; } .three-columns { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 3rem; } .four-columns { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 3rem; }",
  branding: false,
  elementpath: false,
  autoresize_bottom_margin: 0,
  convert_urls: false,
};

type Props = {
  id?: string;
  region: Region;
  isNew: boolean;
  data: Article;
  error?: string;
  errorCode?: number;
};

export default function Edit({ isNew, data, id, region, error, errorCode }: Props) {
  const { send, loading } = useToast();

  const router = useRouter();
  const form = useForm<ArticleInputs>({ defaultValues: data });

  const isState = region.code.split("-").length === 2;
  const stateCode = isState ? region.code : undefined;
  const countryCode = region.code.split("-")[0];

  const handleSubmit: SubmitHandler<ArticleInputs> = async (data) => {
    // @ts-ignore
    if (window.isUploading && !confirm("You have images uploading. Are you sure you want to submit?")) return;

    const response = await send({
      url: `/api/article/set?isNew=${isNew}`,
      method: "POST",
      data: {
        id,
        data: {
          ...data,
          stateCode,
          countryCode,
          hotspots: data.hotspotSelect.map(({ value }) => value),
        },
      },
    });
    if (response.success) {
      router.push(`/article/${response.articleId}`);
    }
  };

  if (error) return <Error statusCode={errorCode || 500} title={error} />;

  return (
    <AdminPage title={`${isNew ? "Add" : "Edit"} Article`}>
      <div className="container pb-16 my-12">
        <Form form={form} onSubmit={handleSubmit}>
          <div className="max-w-4xl mx-auto">
            <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
              <h2 className="text-xl font-bold text-gray-600 border-b pb-4">{isNew ? "Add" : "Edit"} Article</h2>
              <Field label="Title">
                <Input type="text" name="name" required />
                <FormError name="name" />
              </Field>
              <Field label="Content">
                <TinyMCE config={tinyConfig} name="content" defaultValue={data?.content} />
                <FormError name="content" />
              </Field>
              <div>
                <label className="text-gray-500 font-bold">Images</label>
                <ImagesInput hideExtraFields />
              </div>
              <Field label="Attached Hotspots">
                <HotspotSelect name="hotspotSelect" regionCode={region.code} className="mt-1 w-full" isMulti />
              </Field>
            </div>
            <div className="px-4 py-3 bg-gray-100 text-right sm:px-6 rounded">
              <Submit disabled={loading} color="green" className="font-medium">
                Save Article
              </Submit>
            </div>
          </div>
        </Form>
      </div>
    </AdminPage>
  );
}

export const getServerSideProps = getSecureServerSideProps(async ({ query, res }, token) => {
  const articleId = query.articleId as string;
  const regionCode = query.region as string;
  const data: Article | null = articleId !== "new" ? await getArticleByArticleId(articleId) : null;

  const region = getRegion(data ? data.stateCode || data.countryCode : regionCode);
  if (!region || !region.subregions?.length) return { notFound: true };

  if (!canEdit(token, region.code)) {
    res.statusCode = 403;
    return { props: { error: "Access Deneid", errorCode: 403 } };
  }

  const hotspotSelect = data?.hotspots?.map((hotspot) => ({ label: hotspot.name, value: hotspot._id })) || [];

  return {
    props: {
      id: data?._id || null,
      region,
      isNew: !data,
      data: { ...data, hotspotSelect },
    },
  };
});
