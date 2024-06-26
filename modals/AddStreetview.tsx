import React from "react";
import { useModal, ModalFooter } from "providers/modals";
import BtnSmall from "components/BtnSmall";
import StreetView from "components/StreetView";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import useToast from "hooks/useToast";

type Props = {
  onSuccess: (data: any) => void;
  locationId?: string;
};

export default function AddStreetView({ locationId, onSuccess }: Props) {
  const [url, setUrl] = React.useState("");
  const [fov, setFov] = React.useState(70);
  const { send, loading } = useToast();
  const { close } = useModal();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const urlParts = url.split("/");
  const streetviewStr = urlParts.find((part) => part.startsWith("@")) || "";

  const pieces = streetviewStr.split(",");

  const lat = parseFloat(pieces[0]?.split("@")?.[1]);
  const lng = parseFloat(pieces[1]);
  const heading = parseInt(pieces.find((part) => part.endsWith("h"))?.replace("h", "") || "0");
  const tilt = parseInt(pieces.find((part) => part.endsWith("t"))?.replace("t", "") || "0");
  const pitch = tilt ? tilt - 90 : 0;

  const invalid = !!streetviewStr && (!lat || !lng || !fov || !tilt);
  const isValid = !!lat && !!lng && !!fov && !!tilt;

  const handleAdd = async () => {
    const response = await send({
      url: `/api/file/add-streetview`,
      method: "POST",
      data: {
        locationId,
        lat,
        lng,
        fov,
        heading,
        pitch,
      },
    });
    const { imgObject, success } = response;

    if (success) {
      onSuccess(imgObject);
      handleClose();
    } else {
      alert("Error adding street view");
    }
  };

  const handleClose = () => {
    close();
    setUrl("");
    setFov(90);
  };

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <>
      <div className="flex-1">
        <label className="text-gray-500 font-bold">
          Google Street View URL <br />
          <input
            type="text"
            className="form-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            ref={inputRef}
          />
        </label>
      </div>
      {!url && (
        <p className="my-4 font-normal">
          Browse{" "}
          <a href="https://www.google.com/maps" target="_blank" rel="noreferrer">
            Google Maps
          </a>{" "}
          and find a Street View image that you want to include. In Street View mode, copy the browser URL and paste it
          into the field above.
        </p>
      )}
      {invalid && (
        <p className="my-4 font-normal text-amber-700">The URL you entered is not valid. Please try again.</p>
      )}
      {isValid && (
        <StreetView
          lat={lat}
          lng={lng}
          heading={heading}
          pitch={pitch}
          fov={fov}
          className="w-full h-[250px] sm:h-[350px] md:h-[450px] rounded-lg pointer-events-none mt-4"
        />
      )}
      {isValid && (
        <div className="flex-1">
          <label className="text-gray-500 font-bold flex gap-4 mt-4 whitespace-nowrap">
            Field of View <br />
            <input
              type="range"
              min={20}
              max={100}
              step={10}
              value={fov}
              className="w-full"
              onChange={(e) => setFov(parseInt(e.target.value))}
            />
          </label>
        </div>
      )}
      <ModalFooter>
        <BtnSmall
          type="button"
          color="green"
          onClick={handleAdd}
          disabled={!url || invalid || loading}
          className="pl-4 pr-4"
        >
          {loading ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : "Add"}
        </BtnSmall>
        <BtnSmall type="button" color="gray" onClick={handleClose} className="pl-4 pr-4 ml-2">
          Cancel
        </BtnSmall>
      </ModalFooter>
    </>
  );
}
