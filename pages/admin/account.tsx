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
import { auth } from "lib/firebaseAuth";
import {
  updateEmail,
  updatePassword,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import toast from "react-hot-toast";
import RegionSelect from "components/RegionSelect";
import useSecureFetch from "hooks/useSecureFetch";
import { getProfile } from "lib/mongo";
import { getRegionLabel } from "lib/localData";

type AccountInput = {
  name: string;
  email: string;
  new_password?: string;
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
  const { user, loading } = useUser();
  const { email, displayName } = user || {};
  const secureFetch = useSecureFetch();

  const handleSubmit: SubmitHandler<AccountInput> = async ({ email, name, new_password, password, subscriptions }) => {
    if (!auth.currentUser) {
      toast.error("You must be logged in to update your account");
      return;
    }
    if (!password) {
      toast.error("You must enter your current password to update your account");
      return;
    }
    const toastId = toast.loading("saving...");
    try {
      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updateEmail(auth.currentUser, email);
      await updateProfile(auth.currentUser, { displayName: name });
      if (new_password) await updatePassword(auth.currentUser, new_password);
      const res = await secureFetch("/api/account/set", "post", {
        subscriptions: subscriptions?.map((it) => it.value) || [],
        email,
        name,
      });
      if (!res.success) throw new Error("Error updating account");
      toast.success("Account updated successfully");
    } catch (error: any) {
      const message = error.message.includes("auth/wrong-password")
        ? "Current password incorrect"
        : error.message.replace("Firebase: ", "");
      toast.error(message);
    }
    toast.dismiss(toastId);
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
              <Field label="Current Password">
                <Input type="password" name="password" required />
                <FormError name="password" />
              </Field>
              <Field label="New Password (optional)">
                <Input type="password" name="new_password" />
                <FormError name="new_password" />
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
            <Submit disabled={loading} color="green" className="font-medium">
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
