import * as React from "react";
import { useModal, ModalFooter } from "providers/modals";
import BtnSmall from "components/BtnSmall";
import Field from "components/Field";
import RegionSelect from "components/RegionSelect";
import useToast from "hooks/useToast";
import Input from "components/Input";
import Form from "components/Form";
import { useForm, SubmitHandler } from "react-hook-form";
import StateSelect from "components/StateSelect";

type Props = {
  onSuccess: () => void;
  locationId?: string;
};

type Inputs = {
  email: string;
  name: string;
  regions: string[];
  subscriptions?: {
    label: string;
    value: string;
  }[];
};

export default function InviteEditor({ onSuccess }: Props) {
  const { close } = useModal();
  const { send, loading } = useToast();

  const form = useForm<Inputs>({ mode: "onChange" });
  const {
    formState: { isValid },
  } = form;

  const handleSubmit: SubmitHandler<Inputs> = async ({ name, email, regions, subscriptions }) => {
    const response = await send({
      url: "/api/admin/user/invite",
      method: "POST",
      data: { name, email, regions, subscriptions: subscriptions?.map((it) => it.value) || [] },
    });
    if (response.success) {
      onSuccess();
      form.reset();
      close();
    }
  };

  const handleClose = () => {
    close();
    form.reset();
  };

  return (
    <Form form={form} onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Name">
        <Input type="text" name="name" required />
      </Field>
      <Field label="Email">
        <Input type="email" name="email" required />
      </Field>
      <Field label="Region Access">
        <StateSelect name="regions" placeholder="Select regions..." menuPortalTarget={document.body} required isMulti />
      </Field>
      <Field label="Region Subscription">
        <RegionSelect name="subscriptions" menuPortalTarget={document.body} isMulti required />
        <p className="text-xs text-gray-600 mt-2 font-normal">
          The editor will recieve email notifications when users submit content for hotspots in the selected regions.
        </p>
      </Field>
      <ModalFooter>
        <BtnSmall type="submit" color="green" disabled={!isValid || loading} className="pl-4 pr-4">
          Invite
        </BtnSmall>
        <BtnSmall type="button" color="gray" onClick={handleClose} className="pl-4 pr-4 ml-2">
          Cancel
        </BtnSmall>
      </ModalFooter>
    </Form>
  );
}
