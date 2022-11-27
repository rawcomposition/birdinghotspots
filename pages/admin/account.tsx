import * as React from "react";
import DashboardPage from "components/DashboardPage";
import Submit from "components/Submit";
import Input from "components/Input";
import FormError from "components/FormError";
import Form from "components/Form";
import Field from "components/Field";
import { useForm, SubmitHandler } from "react-hook-form";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import { useUser } from "providers/user";
import useToast from "hooks/useToast";
import toast from "react-hot-toast";
import RegionSelect from "components/RegionSelect";
import useSecureFetch from "hooks/useSecureFetch";
import { getProfile } from "lib/mongo";
import { getRegionLabel } from "lib/localData";
import useFirebaseLogin from "hooks/useFirebaseLogin";

type AccountInput = {
  name: string;
  email: string;
  confirm_password?: string;
  password?: string;
  subscriptions?: {
    label: string;
    value: string;
  }[];
};

type Props = {
  subscriptions: {
    label: string;
    value: string;
  }[];
};

export default function Edit({ subscriptions }: Props) {
  const form = useForm<AccountInput>({
    defaultValues: {
      subscriptions,
    },
  });
  const { user, loading: userLoading } = useUser();
  const { email, displayName } = user || {};
  const { login } = useFirebaseLogin();
  const { send, loading } = useToast();

  const handleSubmit: SubmitHandler<AccountInput> = async ({
    email,
    name,
    confirm_password,
    password,
    subscriptions,
  }) => {
    if (password && confirm_password !== password) {
      toast.error("Passwords do not match");
      return;
    }

    const response = await send({
      url: "/api/account/set",
      method: "POST",
      success: "Account updated successfully",
      error: "Error updating account",
      data: {
        subscriptions: subscriptions?.map((it) => it.value) || [],
        email,
        name,
        password,
      },
    });

    if (response.success && password) {
      await login(email, password);
    }
  };

  React.useEffect(() => {
    form.reset({
      name: displayName,
      email,
    });
  }, [email, displayName]);

  return (
    <DashboardPage title="My Account">
      <Form form={form} onSubmit={handleSubmit}>
        <div className="shadow sm:rounded-lg bg-white">
          <div className="px-4 py-5 space-y-6 sm:p-6">
            <div className="max-w-lg space-y-4">
              <Field label="Name">
                <Input type="text" name="name" required />
                <FormError name="name" />
              </Field>
              <Field label="Email">
                <Input type="email" name="email" required />
                <FormError name="email" />
              </Field>
              <Field label="New Password (optional)">
                <Input type="password" name="password" required />
                <FormError name="password" />
              </Field>
              <Field label="Confirm Password">
                <Input type="password" name="confirm_password" />
                <FormError name="confirm_password" />
              </Field>
              <Field label="Region Subscription">
                <RegionSelect name="subscriptions" isMulti restrict />
                <p className="text-xs text-gray-600 mt-2 font-normal">
                  Recieve email notifications when users submit content for hotspots in the selected regions. Your
                  selection will also affect what is visible on the Image/Suggestion review tabs. If you do not choose
                  any regions you will see submissions for states you have editor access to, but you will not recieve
                  any email notifications. States take precedence over counties.
                </p>
              </Field>
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-50 flex justify-end sm:px-6 rounded-b-lg">
            <Submit disabled={loading || userLoading || !user} color="green" className="font-medium">
              Save Account
            </Submit>
          </div>
        </div>
      </Form>
    </DashboardPage>
  );
}

export const getServerSideProps = getSecureServerSideProps(async (context, token) => {
  const uid: string = token.uid;
  if (!uid) return { notFound: true };
  const profile = await getProfile(uid);

  const subscriptions =
    profile?.subscriptions?.map((it: string) => ({
      label: getRegionLabel(it),
      value: it,
    })) || [];

  return {
    props: {
      subscriptions,
    },
  };
});
