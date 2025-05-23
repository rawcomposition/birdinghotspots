import React from "react";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import { useForm, SubmitHandler } from "react-hook-form";
import Input from "components/Input";
import Form from "components/Form";
import Submit from "components/Submit";
import { getHotspotByLocationId } from "lib/mongo";
import { Image } from "lib/types";
import useToast from "hooks/useToast";
import Error from "next/error";
import ImagesInput from "components/ImagesInput";
import FormError from "components/FormError";
import { useUser } from "providers/user";
import Link from "next/link";
import Title from "components/Title";
import useRecaptcha from "hooks/useRecaptcha";
import { useRouter } from "next/router";

type Inputs = {
  name: string;
  email: string;
  images: Image[];
};

type Props = {
  locationId: string;
  hotspotName: string;
  error?: string;
};

export default function Upload({ locationId, hotspotName, error }: Props) {
  const [success, setSuccess] = React.useState<boolean>(false);
  const { send, loading } = useToast();
  const { user } = useUser();
  const userEmail = user?.email;
  useRecaptcha();
  const router = useRouter();

  const defaultName = typeof localStorage !== "undefined" ? localStorage?.getItem("name") || "" : "";
  const defaultEmail = typeof localStorage !== "undefined" ? localStorage?.getItem("email") || "" : "";

  const form = useForm<Inputs>({
    defaultValues: {
      name: defaultName,
      email: defaultEmail,
    },
  });

  React.useEffect(() => {
    if (!userEmail) return;
    form.setValue("email", userEmail);
  }, [userEmail]);

  const name = form.watch("name");
  const email = form.watch("email");

  React.useEffect(() => {
    localStorage.setItem("name", name);
    localStorage.setItem("email", email);
  }, [name, email]);

  const submit = async ({ name, email, images }: Inputs, token: string) => {
    // @ts-ignore
    if (window.isUploading && !confirm("You have images uploading. Are you sure you want to submit?")) return;
    const response = await send({
      url: "/api/hotspot/upload",
      method: "POST",
      data: {
        token,
        locationId,
        images,
        name,
        email,
      },
    });
    if (response.success) {
      if (user?.uid) {
        router.push(`/hotspot/${locationId}`);
        return;
      }
      setSuccess(true);
    }
  };

  const value = form.watch("images");

  const handleSubmit: SubmitHandler<Inputs> = async (data) => {
    // @ts-ignore
    window.grecaptcha.ready(() => {
      // @ts-ignore
      window.grecaptcha.execute(process.env.NEXT_PUBLIC_RECAPTCHA_KEY, { action: "submit" }).then((token: string) => {
        submit(data, token);
      });
    });
  };

  if (error) return <Error statusCode={404} title={error} />;
  if (success)
    return (
      <div className="container pb-16 my-12 max-w-2	xl mx-auto text-center">
        <h1 className="text-lime-600 text-xl font-bold mb-4">Upload Complete</h1>
        <p className="text-lg text-gray-500 mb-4">
          Thanks for contributing!{" "}
          {user?.uid ? "Your photos have been added to the hotspot." : "An editor will review your photos shortly."}
        </p>
        <Link href={`/hotspot/${locationId}`} className="text-sky-700 font-bold">
          Back to Hotspot
        </Link>
      </div>
    );

  return (
    <div className="container pb-16 my-12 max-w-xl mx-auto">
      <Title>{`Upload Photos to ${hotspotName}`}</Title>
      <h2 className="text-xl font-bold text-gray-600 border-b pb-4 leading-6">
        Upload Photos
        <br />
        <span className="text-sm text-gray-500 font-normal">{hotspotName}</span>
      </h2>
      <div className="bg-gray-100 p-4 mt-8">
        <ul className="space-y-1 list-disc ml-5">
          <li className="font-medium text-amber-600">Only upload photos that you own</li>
          <li>
            Upload photos of habitat, features, ponds, trails, parking &ndash; help birders know what to expect when
            they visit.
          </li>
          <li>Choose a few of your best photos from the hotspot</li>
          <li>Avoid adding a watermark your images</li>
        </ul>
      </div>
      <Form form={form} onSubmit={handleSubmit} className="form-text-lg">
        <div className="pt-5 bg-white space-y-6 flex-1">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-gray-500 font-bold">
                Your Name{" "}
                <span className="text-[12px] text-gray-500 font-normal leading-4"> &ndash; Used for attribution</span>
                <br />
                <Input type="text" name="name" required />
                <FormError name="name" />
              </label>
            </div>
            <div className="flex-1">
              <label className="text-gray-500 font-bold">
                Email{" "}
                <span className="text-[12px] text-gray-500 font-normal leading-4">
                  &ndash; If editors need to contact you
                </span>
                <br />
                <Input type="text" name="email" required />
                <FormError name="email" />
              </label>
            </div>
          </div>
          <ImagesInput hideExtraFields />
          <div className="px-4 py-3 bg-gray-100 flex flex-col gap-3 md:flex-row justify-between sm:px-6 rounded">
            <p className="text-xs leading-5 text-gray-500 md:max-w-[250px]">
              By uploading you agree to release the photos into the public domain (CC0 license).
            </p>
            <Submit disabled={loading || value?.length < 1} color="green" className="font-medium">
              Submit Photos
            </Submit>
          </div>
        </div>
      </Form>
    </div>
  );
}

interface Params extends ParsedUrlQuery {
  locationId: string;
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { locationId } = query as Params;

  return {
    redirect: {
      destination: `/hotspot/${locationId}`,
      permanent: false,
    },
  };

  const hotspot = await getHotspotByLocationId(locationId);
  if (!hotspot) return { notFound: true };

  return {
    props: {
      locationId,
      hotspotName: hotspot?.name,
    },
  };
};
