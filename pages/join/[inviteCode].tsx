import React from "react";
import { GetServerSideProps } from "next";
import Input from "components/Input";
import Submit from "components/Submit";
import { useForm, SubmitHandler } from "react-hook-form";
import Form from "components/Form";
import FormError from "components/FormError";
import UtilityPage from "components/UtilityPage";
import { getProfileByCode } from "lib/mongo";
import toast from "react-hot-toast";
import useToast from "hooks/useToast";
import useFirebaseLogin from "hooks/useFirebaseLogin";
import { useRouter } from "next/router";

type Inputs = {
  password: string;
  passwordConfirm: string;
};

type Props = {
  email: string;
  inviteCode: any;
};

export default function Join({ inviteCode, email }: Props) {
  const form = useForm<Inputs>();
  const { send, loading } = useToast();
  const { login, loading: loggingIn } = useFirebaseLogin();
  const router = useRouter();

  const handleSubmit: SubmitHandler<Inputs> = async ({ password, passwordConfirm }) => {
    if (password !== passwordConfirm) {
      toast.error("Passwords do not match");
      return;
    }
    const response = await send({
      url: "/api/admin/user/join",
      method: "POST",
      data: { inviteCode, password },
    });
    if (response.success) {
      await login(email, password);
      router.push("/admin");
    }
  };

  return (
    <UtilityPage heading="Set Password">
      <Form onSubmit={handleSubmit} form={form}>
        <div className="mb-4">
          <label className="text-gray-600">
            New Password
            <br />
            <Input type="password" name="password" required />
          </label>
          <FormError name="password" />
        </div>
        <div className="mb-4">
          <label className="text-gray-600">
            Confirm Password
            <br />
            <Input type="password" name="passwordConfirm" required />
          </label>
          <FormError name="passwordConfirm" />
        </div>
        <p className="text-center mt-8">
          <Submit loading={loading} color="green">
            Set Password
          </Submit>
        </p>
      </Form>
    </UtilityPage>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const inviteCode = query.inviteCode as string;
  const profile = await getProfileByCode(inviteCode);
  console.log(inviteCode);
  if (!profile) return { notFound: true };

  return { props: { inviteCode, email: profile.email } };
};
