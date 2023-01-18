import React from "react";
import { useModal, ModalFooter } from "providers/modals";
import EbirdDescription from "components/EbirdDescription";
import EbirdHelpLinks from "components/EbirdHelpLinks";
import BtnSmall from "components/BtnSmall";

type Props = {
  label: string;
};

export default function EditPoints({ label }: Props) {
  const { close } = useModal();

  return (
    <>
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h3 className="text-lg mb-1.5 font-bold">Finding Birding Locations in {label}</h3>
          <p className="mb-4">
            This website provides descriptions and maps of eBird Hotspots in {label}. In eBird, Hotspots are shared
            locations where birders may report their bird sightings to eBird. Hotspots provide birders with information
            about birding locations where birds are being seen.
          </p>
          <p className="mb-4">
            Hotspots are organized by county. If you know the county of a location, click on the county name in the{" "}
            <a href="#counties">Alphabetical list of {label} Counties</a> to access information about birds and all the
            eBird hotspots in that county.
          </p>
          <p className="mb-4">
            If you do not know the county, select a hotspot from the Alphabetical list of {label} Hotspots. Or use the
            “magnifying glass” search icon on the upper right to find a hotspot. Enter all or part of a hotspot name.
          </p>
          <h3 className="text-lg mb-1.5 font-bold">Resources</h3>
          <a href="https://www.allaboutbirds.org/" target="_blank" rel="noreferrer">
            All About Birds
          </a>{" "}
          – online bird guide
          <br />
          <a href="https://birdsoftheworld.org/bow/home" target="_blank" rel="noreferrer">
            Birds of the World
          </a>
          <br />
          <a href="http://www.pwrc.usgs.gov/BBL/MANUAL/speclist.cfm" target="_blank" rel="noreferrer">
            Alpha Codes (4-letter)
          </a>
          <br />
          <a href="http://www.aba.org/about/ethics.html" target="_blank" rel="noreferrer">
            Code of Birding Ethics
          </a>
          <br />
        </div>
        <div>
          <EbirdDescription />
          <EbirdHelpLinks />
        </div>
      </div>
      <ModalFooter>
        <BtnSmall type="button" color="gray" onClick={close} className="px-4">
          Close
        </BtnSmall>
      </ModalFooter>
    </>
  );
}
