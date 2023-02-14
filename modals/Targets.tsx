import React from "react";
import { useModal, ModalFooter } from "providers/modals";
import EbirdDescription from "components/EbirdDescription";
import EbirdHelpLinks from "components/EbirdHelpLinks";
import BtnSmall from "components/BtnSmall";

type Props = {
  locationId: string;
};

export default function Targets({ locationId }: Props) {
  const { close } = useModal();

  return (
    <>
      <div>
        <iframe src="https://app.hey.com/" sandbox="allow-top-navigation" width="100%" height="600" />
      </div>
      <ModalFooter>
        <BtnSmall type="button" color="gray" onClick={close} className="px-4">
          Close
        </BtnSmall>
      </ModalFooter>
    </>
  );
}
