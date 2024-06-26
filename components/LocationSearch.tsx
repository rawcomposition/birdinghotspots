import React from "react";
import { LocationSearchValue } from "lib/types";
import Regions from "data/regions.json";

const countries = Regions.map((it) => it.code.toLowerCase());

type Props = {
  className?: string;
  value: LocationSearchValue | null;
  onChange: (value: LocationSearchValue) => void;
};

export default function LocationSearch({ className, value, onChange, ...props }: Props) {
  const { label } = value || {};
  const inputRef = React.useRef(null);
  const isInitalizedRef = React.useRef<boolean>();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  };

  React.useEffect(() => {
    //@ts-ignore
    if (isInitalizedRef.current || !window.google) {
      return;
    }
    const handlePlaceSelect = (googlePlaces: any) => {
      const place = googlePlaces.getPlace();
      onChange({
        label: place.formatted_address,
        lat: parseFloat(place.geometry.location.lat().toFixed(7)),
        lng: parseFloat(place.geometry.location.lng().toFixed(7)),
      });
    };

    const options = {
      componentRestrictions: { country: countries },
      fields: ["formatted_address", "geometry"],
    };

    //@ts-ignore
    const googlePlaces = new window.google.maps.places.Autocomplete(inputRef.current, options);
    googlePlaces.setFields(["formatted_address", "geometry"]);
    googlePlaces.addListener("place_changed", () => {
      handlePlaceSelect(googlePlaces);
    });
    isInitalizedRef.current = true;
  });

  React.useEffect(() => {
    if (!label && inputRef.current) {
      (inputRef.current as HTMLInputElement).value = "";
    }
  }, [label]);

  return (
    <>
      <input
        type="search"
        ref={inputRef}
        onKeyDown={handleKeyDown}
        defaultValue={label}
        placeholder="Search for a city or address"
        className={className || ""}
        {...props}
      />
    </>
  );
}
