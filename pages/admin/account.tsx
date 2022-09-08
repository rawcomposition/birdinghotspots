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

type AccountInput = {
  name: string;
  email: string;
  new_password?: string;
  password?: string;
};

export default function Edit() {
  const form = useForm<AccountInput>();
  const { user, loading } = useUser();
  const { email, displayName } = user || {};

  const handleSubmit: SubmitHandler<AccountInput> = async ({ email, name, new_password, password }) => {
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

export const getServerSideProps = getSecureServerSideProps(async () => ({ props: {} }));
