import React from "react";
import getSecureServerSideProps from "lib/getSecureServerSideProps";
import { useRouter } from "next/router";
import { useForm, SubmitHandler } from "react-hook-form";
import Form from "components/Form";
import Submit from "components/Submit";
import { getSpeciesByCode } from "lib/mongo";
import AdminPage from "components/AdminPage";
import { SpeciesT } from "lib/types";
import useToast from "hooks/useToast";
import ImagesInput from "components/ImagesInput";

type Props = {
  id: string;
  data: SpeciesT;
};

export default function Edit({ id, data }: Props) {
  const { send, loading } = useToast();

  const router = useRouter();
  const form = useForm<any>({ defaultValues: data });

  const handleSubmit: SubmitHandler<any> = async (data) => {
    const response = await send({
      url: `/api/species/${id}/update`,
      method: "PUT",
      data,
    });
    if (response.success) {
      router.push(response.url);
    }
  };

  return (
    <AdminPage title="Edit Species">
      <div className="container pb-16 my-12">
        <h2 className="text-xl font-bold text-gray-600 border-b pb-4">Edit Species</h2>
        <Form form={form} onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-8">
            <div>
              <label className="text-gray-500 font-bold">Maps</label>
              <ImagesInput hideMapCheckbox showHideFromChildrenCheckbox />
            </div>
          </div>
          <div className="px-4 py-3 bg-gray-100 text-right rounded mt-4 md:hidden">
            <Submit disabled={loading} color="green" className="font-medium">
              Save Species
            </Submit>
          </div>
        </Form>
      </div>
    </AdminPage>
  );
}

export const getServerSideProps = getSecureServerSideProps(async ({ query, res }, token) => {
  const code = query.code as string;

  const data = await getSpeciesByCode(code);
  if (!data) return { notFound: true };

  return {
    props: {
      code,
      data,
    },
  };
});
