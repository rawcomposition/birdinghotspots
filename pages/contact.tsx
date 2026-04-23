import React from "react";
import PageHeading from "components/PageHeading";
import { useForm } from "react-hook-form";
import Input from "components/Input";
import Textarea from "components/Textarea";
import Form from "components/Form";
import Submit from "components/Submit";
import Title from "components/Title";
import Field from "components/Field";
import PublicAnnouncement from "components/PublicAnnouncement";

type Inputs = {
  locationId: string;
};

export default function Contact() {
  const form = useForm<Inputs>();

  return (
    <div className="container pb-16 mt-12">
      <Title>Contact Us</Title>
      <PageHeading>Contact Us</PageHeading>

      <div className="max-w-2xl mx-auto">
        <PublicAnnouncement />
        <Form form={form} onSubmit={() => {}}>
          <p className="mb-4 font-bold text-gray-600">
            This contact form is no longer accepting submissions. Birding Hotspots is now in a read-only state, and
            content has been integrated into eBird.
          </p>
          <p className="mb-4">
            To make a comment or correction about a specific hotspot, please visit that hotspot on{" "}
            <a href="https://ebird.org" target="_blank" rel="noreferrer" className="text-primary hover:text-secondary">
              eBird
            </a>
            .
          </p>
          <div className="py-5 bg-white space-y-6">
            <div className="flex gap-4">
              <Field label="Name">
                <Input type="text" name="name" disabled />
              </Field>
              <Field label="Email">
                <Input type="email" name="email" disabled />
              </Field>
            </div>
            <Field label="Message">
              <Textarea name="message" rows={7} disabled />
            </Field>
          </div>
          <div className="px-4 py-3 mt-2 bg-gray-100 text-right sm:px-6 rounded">
            <Submit color="green" className="font-medium" disabled>
              Submit
            </Submit>
          </div>
        </Form>
      </div>
    </div>
  );
}
