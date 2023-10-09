import React from "react";
import { ParsedUrlQuery } from "querystring";
import admin from "lib/firebaseAdmin";
import DashboardPage from "components/DashboardPage";
import { User } from "lib/types";
import Submit from "components/Submit";
import Input from "components/Input";
import FormError from "components/FormError";
import Form from "components/Form";
import Field from "components/Field";
import Select from "components/Select";
import { useForm, SubmitHandler } from "react-hook-form";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import { useRouter } from "next/router";
import useToast from "hooks/useToast";
import { roles } from "lib/helpers";
import DeleteBtn from "components/DeleteBtn";
import RegionSelect from "components/RegionSelect";
import { getProfile } from "lib/mongo";
import { getRegion } from "lib/localData";

type UserInput = {
  role: string;
  name: string;
  email: string;
  regions?: {
    label: string;
    value: string;
  }[];
  subscriptions?: {
    label: string;
    value: string;
  }[];
  emailFrequency?: string;
};

type Props = {
  user: User;
  subscriptions: {
    label: string;
    value: string;
  }[];
  regions: {
    label: string;
    value: string;
  }[];
  emailFrequency: string;
};

const roleOptions = roles.map(({ id, name }) => ({ value: id, label: name }));

export default function Edit({ user, subscriptions, regions, emailFrequency }: Props) {
  const router = useRouter();
  const form = useForm<UserInput>({
    defaultValues: {
      name: user.displayName,
      email: user.email,
      role: user.role,
      regions,
      subscriptions,
      emailFrequency,
    },
  });

  const { send, loading } = useToast();

  const handleSubmit: SubmitHandler<UserInput> = async (data) => {
    const response = await send({
      url: `/api/admin/user/set/${user.uid}`,
      method: "POST",
      data: {
        data: {
          ...data,
          subscriptions: data?.subscriptions?.map((it) => it.value) || [],
          regions: data?.regions?.map((it) => it.value) || [],
        },
      },
    });
    if (response.success) {
      router.push("/admin/user/list");
    }
  };

  const role = form.watch("role");

  const frequencyOptions = [
    { label: "Daily", value: "daily" },
    { label: "Instant", value: "instant" },
    { label: "No Email", value: "none" },
  ];

  return (
    <DashboardPage title="Edit User">
      <Form form={form} onSubmit={handleSubmit} className="mb-12">
        <div className="shadow sm:rounded-lg bg-white">
          <div className="px-4 py-5 space-y-6 sm:p-6">
            <Field label="Name">
              <Input type="text" name="name" required />
              <FormError name="name" />
            </Field>
            <Field label="Email">
              <Input type="email" name="email" required />
              <FormError name="email" />
            </Field>
            <Field label="Role">
              <Select name="role" options={roleOptions} required />
            </Field>
            {role === "editor" && (
              <Field label="Region Access">
                <RegionSelect name="regions" required isMulti syncRegionsOnly />
                <FormError name="marketIds" />
              </Field>
            )}
            <Field label="Region Subscription">
              <RegionSelect name="subscriptions" isMulti />
              <p className="text-xs text-gray-600 mt-2 font-normal">
                The editor will recieve email notifications when users submit content for hotspots in the selected
                regions.
              </p>
            </Field>
            <Field label="Email Frequency">
              <Select name="emailFrequency" options={frequencyOptions} required />
              <FormError name="emailFrequency" />
            </Field>
          </div>
          <div className="px-4 py-3 bg-gray-50 flex justify-between sm:px-6 rounded-b-lg">
            <DeleteBtn url={`/api/admin/user/delete/${user.uid}`} entity="user" redirect="/admin/user/list">
              Delete User
            </DeleteBtn>
            <Submit disabled={loading} color="green" className="font-medium">
              Save User
            </Submit>
          </div>
        </div>
      </Form>
    </DashboardPage>
  );
}

interface Params extends ParsedUrlQuery {
  uid: string;
}

export const getServerSideProps = getSecureServerSideProps(async (context, token) => {
  const { uid } = context.query as Params;
  try {
    const { email, displayName, customClaims } = await admin.getUser(uid);
    const profile = await getProfile(uid);

    const subscriptions =
      profile?.subscriptions?.map((it: string) => ({
        label: getRegion(it)?.detailedName || it,
        value: it,
      })) || [];

    const regions =
      customClaims?.regions?.map((it: string) => ({
        label: getRegion(it)?.detailedName || it,
        value: it,
      })) || [];

    return {
      props: {
        user: {
          uid,
          email,
          displayName: displayName || null,
          role: customClaims?.role || null,
        },
        subscriptions,
        regions,
        emailFrequency: profile?.emailFrequency || "daily",
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
}, true);
