import React from "react";
import ModalWrapper from "components/ModalWrapper";
import { ModalFooter } from "providers/modals";
import BtnSmall from "components/BtnSmall";
import Field from "components/Field";
import toast from "react-hot-toast";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

type Props = {
  open: boolean;
  onClose: () => void;
  onSynced: (result: { label: string; value: string }) => void;
};

export default function SyncHotspotModal({ open, onClose, onSynced }: Props) {
  const [locationId, setLocationId] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleClose = () => {
    setLocationId("");
    setLoading(false);
    onClose();
  };

  const handleSync = async () => {
    const trimmed = locationId.trim();
    if (!trimmed) return;

    if (!/^L\d+$/.test(trimmed)) {
      toast.error("Invalid format. eBird hotspot IDs start with L followed by numbers (e.g. L12345678).");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/hotspot/sync-one", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationId: trimmed }),
      });

      const json = await response.json();

      if (!response.ok) {
        toast.error(json.error || "Failed to sync hotspot.");
        return;
      }

      toast.success("Hotspot synced successfully.");
      onSynced({ label: json.label, value: json.value });
      handleClose();
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper title="Sync eBird Hotspot" open={open} onClose={handleClose} maxWidth="500px">
      <p className="mb-4 font-normal">
        Enter an eBird hotspot ID to sync it into the database. Use this when you&apos;ve just created a hotspot on
        eBird and it hasn&apos;t been picked up by the automatic sync yet.
      </p>
      <Field label="eBird Hotspot ID">
        <input
          type="text"
          className="form-input"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          placeholder="e.g. L12345678"
          disabled={loading}
          ref={inputRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSync();
            }
          }}
        />
      </Field>

      <ModalFooter>
        <BtnSmall
          type="button"
          color="green"
          onClick={handleSync}
          disabled={loading || !locationId.trim()}
          className="pl-4 pr-4"
        >
          {loading ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : "Sync Hotspot"}
        </BtnSmall>
        <BtnSmall type="button" color="gray" onClick={handleClose} className="pl-4 pr-4 ml-2">
          Cancel
        </BtnSmall>
      </ModalFooter>
    </ModalWrapper>
  );
}
