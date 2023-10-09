import React from "react";
import { GetServerSideProps } from "next";
import { ParsedUrlQuery } from "querystring";
import { useForm, SubmitHandler } from "react-hook-form";
import Input from "components/Input";
import Textarea from "components/Textarea";
import Form from "components/Form";
import Submit from "components/Submit";
import { getHotspotByLocationId } from "lib/mongo";
import useToast from "hooks/useToast";
import Error from "next/error";
import TinyMCE from "components/TinyMCE";
import Field from "components/Field";
import FormError from "components/FormError";
import { useUser } from "providers/user";
import Link from "next/link";
import Title from "components/Title";
import useRecaptcha from "hooks/useRecaptcha";
import RadioGroup from "components/RadioGroup";

type Inputs = {
  name: string;
  email: string;
  birds: string;
  hikes: string;
  about: string;
  tips: string;
  roadside: string;
  restrooms: string;
  accessible: string;
  fee: string;
};

type Props = {
  locationId: string;
  hotspotName: string;
  data: {
    birds: string;
    hikes: string;
    about: string;
    tips: string;
    roadside: string;
    restrooms: string;
    accessible: string;
    fee: string;
  };
  error?: string;
};

export default function Upload({ locationId, hotspotName, data, error }: Props) {
  const [success, setSuccess] = React.useState<boolean>(false);
  const { send, loading } = useToast();
  const { user } = useUser();
  const userEmail = user?.email;
  useRecaptcha();

  const defaultName = typeof localStorage !== "undefined" ? localStorage?.getItem("name") || "" : "";
  const defaultEmail = typeof localStorage !== "undefined" ? localStorage?.getItem("email") || "" : "";

  const form = useForm<Inputs>({
    defaultValues: {
      name: defaultName,
      email: defaultEmail,
      ...data,
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

  const submit = async ({ name, email, ...data }: Inputs, token: string) => {
    const response = await send({
      url: "/api/hotspot/suggest",
      method: "POST",
      data: {
        token,
        locationId,
        name,
        email,
        ...data,
      },
    });
    if (response.success) {
      setSuccess(true);
    }
  };

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
        <h1 className="text-lime-600 text-xl font-bold mb-4">Suggestion Received!</h1>
        <p className="text-lg text-gray-500 mb-4">
          Thanks for contributing! An editor will review your suggestion shortly.
        </p>
        <Link href="/hotspot/[locationId]" as={`/hotspot/${locationId}`} className="text-sky-700 font-bold">
          Back to Hotspot
        </Link>
      </div>
    );

  return (
    <div className="container pb-16 my-12 max-w-xl mx-auto">
      <Title>{`Suggest Edit for ${hotspotName}`}</Title>
      <h2 className="text-xl font-bold text-gray-600 border-b pb-4 leading-6">
        Suggest Edit
        <br />
        <span className="text-sm text-gray-500 font-normal">{hotspotName}</span>
      </h2>
      <div className="bg-gray-100 p-4 mt-8">
        <ul className="space-y-1 list-disc ml-5">
          <li>We welcome additions or changes in any of the content areas below.</li>
          <li>
            General comments can go in the <strong>Notes to the editor</strong> section.
          </li>
        </ul>
      </div>
      <Form form={form} onSubmit={handleSubmit} className="form-text-lg">
        <div className="pt-5 bg-white space-y-6 flex-1">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-gray-500 font-bold">
                Your Name <br />
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

          <Field label="Tips for Birding">
            <TinyMCE name="tips" defaultValue={data.tips} />
          </Field>

          <Field label="Birds of Interest">
            <TinyMCE name="birds" defaultValue={data.birds} />
          </Field>

          <Field label="About this location">
            <TinyMCE name="about" defaultValue={data.about} />
          </Field>

          <Field label="Notable Trails">
            <TinyMCE name="hikes" defaultValue={data.hikes} />
          </Field>

          <RadioGroup name="restrooms" label="Restrooms on site" options={["Yes", "No", "Unknown"]} inline />
          <RadioGroup
            name="accessible"
            label="Wheelchair accessible trail"
            help="Is there a wheelchair accessible trail at this location?"
            options={["Yes", "No", "Unknown"]}
            inline
          />
          <RadioGroup
            name="roadside"
            label="Roadside viewing"
            help="Is this a location where birders may can watch from a vehicle?"
            options={["Yes", "No", "Unknown"]}
            inline
          />
          <RadioGroup name="fee" label="Entrance fee" options={["Yes", "No", "Unknown"]} inline />

          <div className="bg-gray-100 px-4 pb-4 pt-3 rounded-lg">
            <Field label="Notes to the editor">
              <Textarea name="notes" />
            </Field>
          </div>

          <div className="px-4 py-3 bg-gray-100 flex flex-col gap-3 md:flex-row justify-end sm:px-6 rounded">
            <Submit disabled={loading} color="green" className="font-medium">
              Submit Suggestion
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
  const hotspot = await getHotspotByLocationId(locationId);
  if (!hotspot) return { notFound: true };

  return {
    props: {
      locationId,
      hotspotName: hotspot?.name,
      data: {
        about: hotspot?.about || "",
        birds: hotspot?.birds || "",
        hikes: hotspot?.hikes || "",
        tips: hotspot?.tips || "",
        roadside: hotspot?.roadside || "Unknown",
        restrooms: hotspot?.restrooms || "Unknown",
        accessible: hotspot?.accessible || "Unknown",
        fee: hotspot?.fee || "Unknown",
      },
    },
  };
};
