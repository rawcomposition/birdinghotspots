import * as React from "react";
import type { NextPage } from "next";
import Input from "components/Input";
import Submit from "components/Submit";
import { useForm, SubmitHandler } from "react-hook-form";
import Form from "components/Form";
import FormError from "components/FormError";
import UtilityPage from "components/UtilityPage";
import { resetPassword } from "lib/firebaseAuth";

type Inputs = {
  email: string;
};

const Forgot: NextPage = () => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [showSuccess, setShowSuccess] = React.useState<boolean>(false);
  const form = useForm<Inputs>();

  const handleSubmit: SubmitHandler<Inputs> = async ({ email }) => {
    setLoading(true);
    await resetPassword(email);
    setShowSuccess(true);
    setLoading(false);
  };

  return (
    <UtilityPage heading="Forgot Password">
      <Form onSubmit={handleSubmit} form={form}>
        <div className="mb-4">
          <label className="text-gray-600">
            Email
            <br />
            <Input type="email" name="email" required />
          </label>
          <FormError name="email" />
        </div>
        {showSuccess && (
          <div className="bg-yellow-200 p-4 rounded">An email has been sent with further instructions</div>
        )}
        {!showSuccess && (
          <p className="text-center mt-8">
            <Submit loading={loading} color="green">
              Reset Password
            </Submit>
          </p>
        )}
      </Form>
    </UtilityPage>
  );
};

export default Forgot;