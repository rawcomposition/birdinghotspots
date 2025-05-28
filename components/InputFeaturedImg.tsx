import { useFormContext, useController } from "react-hook-form";
import { useModal } from "providers/modals";
import { FeaturedMlImg } from "lib/types";

type Props = {
  name: string;
  label: string;
  locationId: string;
  disabledIds?: string[];
};

export default function InputFeaturedImg({ name, label, locationId, disabledIds }: Props) {
  const { open } = useModal();
  const { control } = useFormContext();

  const { field } = useController({
    control,
    name,
  });

  const selectedId = field.value?.id;

  const onSelect = (photo: FeaturedMlImg) => {
    field.onChange(photo);
  };

  return (
    <button
      type="button"
      onClick={() => open("featuredPhotoPicker", { locationId, disabledIds, selectedId, onSelect })}
      className="bg-gray-200 rounded relative overflow-hidden w-full max-w-sm aspect-[4/3] group"
    >
      {selectedId && (
        <img
          src={`https://cdn.download.ams.birds.cornell.edu/api/v2/asset/${selectedId.replace("ML", "")}/480`}
          alt="Featured Photo"
          className="w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        {selectedId ? (
          <div className="bg-white/80 opacity-0 group-hover:opacity-100 hover:bg-white/100 transition-all text-gray-700 text-sm font-medium px-2 py-1 rounded-md">
            Replace Image
          </div>
        ) : (
          <span className="text-gray-700 text-[15px] font-medium">Select {label}</span>
        )}
      </div>
    </button>
  );
}
