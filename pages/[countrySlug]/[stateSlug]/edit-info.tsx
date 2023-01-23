import * as React from "react";
import { ParsedUrlQuery } from "querystring";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import Form from "components/Form";
import Submit from "components/Submit";
import Input from "components/Input";
import { getRegionInfo } from "lib/mongo";
import AdminPage from "components/AdminPage";
import { State, Link, RegionInfo } from "lib/types";
import useToast from "hooks/useToast";
import FormError from "components/FormError";
import { getState } from "lib/localData";
import InputLinks from "components/InputLinks";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import Error from "next/error";

type Props = {
  state: State;
  data: RegionInfo | null;
  error?: string;
  errorCode?: number;
};

type Inputs = {
  websitesHeading: string;
  socialHeading: string;
  clubsHeading: string;
  websiteLinks: Link[];
  socialLinks: Link[];
  clubLinks: Link[];
};

export default function EditLinks({ state, data, error, errorCode }: Props) {
  const { send, loading } = useToast();

  const router = useRouter();
  const form = useForm<Inputs>({
    defaultValues: {
      websitesHeading: data?.websitesHeading || "Websites",
      socialHeading: data?.socialHeading || "Social Media and Other Groups",
      clubsHeading: data?.clubsHeading || "Bird Clubs and Organizations",
      ...data,
    },
  });

  const handleSubmit: SubmitHandler<Inputs> = async (data) => {
    const response = await send({
      url: "/api/state-info/set",
      method: "POST",
      data: {
        code: state.code,
        data,
      },
    });
    if (response.success) {
      router.push(`/${state.country.toLowerCase()}/${state.slug}`);
    }
  };

  if (error) return <Error statusCode={errorCode || 500} title={error} />;

  return (
    <AdminPage title="Edit More Information Links">
      <div className="container pb-16 my-12">
        <Form form={form} onSubmit={handleSubmit}>
          <div className="max-w-4xl mx-auto">
            <div className="px-4 py-5 bg-white sm:p-6">
              <h2 className="text-xl font-bold text-gray-600 border-b pb-4 mb-8">Edit {state.label} Links</h2>
              <div className="space-y-4 mb-12">
                <Input type="text" name="websitesHeading" required />
                <FormError name="websitesHeading" />
                <InputLinks name="websiteLinks" />
              </div>
              <div className="space-y-4 mb-12">
                <Input type="text" name="socialHeading" required />
                <FormError name="socialHeading" />
                <InputLinks name="socialLinks" />
              </div>
              <div className="space-y-4 mb-12">
                <Input type="text" name="clubsHeading" required />
                <FormError name="clubsHeading" />
                <InputLinks name="clubLinks" />
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-100 text-right sm:px-6 rounded">
              <Submit disabled={loading} color="green" className="font-medium">
                Save Links
              </Submit>
            </div>
          </div>
        </Form>
      </div>
    </AdminPage>
  );
}

interface Params extends ParsedUrlQuery {
  stateSlug: string;
}

export const getServerSideProps = getSecureServerSideProps(async ({ query, res }, token) => {
  const { stateSlug } = query as Params;

  const state = getState(stateSlug);
  if (!state) return { notFound: true };

  const data = (await getRegionInfo(state.code)) || null;
  const { role, regions } = token;
  if (role !== "admin" && !regions.includes(state.code)) {
    res.statusCode = 403;
    return { props: { error: "Access Deneid", errorCode: 403 } };
  }

  return {
    props: { state, data },
  };
});
