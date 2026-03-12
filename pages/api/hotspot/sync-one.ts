import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import Logs from "models/Log";
import secureApi from "lib/secureApi";
import { getEbirdHotspot } from "lib/helpers";

export default secureApi(async (req, res, token) => {
  const { locationId } = req.body as { locationId: string };

  if (!locationId || !/^L\d+$/.test(locationId)) {
    res.status(400).json({ error: "Invalid eBird hotspot ID. Must be in the format L followed by numbers (e.g. L12345678)." });
    return;
  }

  try {
    await connect();

    const ebirdHotspot = await getEbirdHotspot(locationId);
    if (!ebirdHotspot) {
      res.status(404).json({ error: "Hotspot not found on eBird. Make sure the ID is correct and the hotspot has been approved on eBird." });
      return;
    }

    const { name, lat, lng, subnational1Code, subnational2Code, numSpeciesAllTime } = ebirdHotspot;

    if (!name || !lat || !lng) {
      res.status(400).json({ error: "eBird hotspot is missing required data (name, lat, or lng)." });
      return;
    }

    const hasValidStateCode = (subnational1Code?.split("-")?.filter(Boolean)?.length || 0) > 1;
    const stateCode = hasValidStateCode ? subnational1Code : null;
    const countryCode = subnational1Code?.split("-")?.[0];
    const countyCode = subnational2Code || null;

    let location = null;
    if (lat && lng) {
      location = {
        type: "Point",
        coordinates: [lng, lat],
      };
    }

    const existing = await Hotspot.findOne({ locationId });

    if (existing) {
      await Hotspot.updateOne(
        { locationId },
        {
          name,
          lat,
          lng,
          location,
          species: numSpeciesAllTime,
          countyCode,
        }
      );

      await Logs.create({
        user: token.name,
        uid: token.uid,
        type: "sync_hotspot",
        message: `manually synced hotspot: ${name} (${locationId})`,
        hotspotId: locationId,
      });

      res.status(200).json({
        success: true,
        action: "updated",
        label: name,
        value: existing._id.toString(),
      });
    } else {
      const newHotspot = await Hotspot.create({
        name,
        zoom: 14,
        lat,
        lng,
        countryCode,
        stateCode,
        countyCode,
        locationId,
        url: `/hotspot/${locationId}`,
        location,
        noContent: true,
        species: numSpeciesAllTime,
      });

      await Logs.create({
        user: token.name,
        uid: token.uid,
        type: "sync_hotspot",
        message: `manually synced new hotspot: ${name} (${locationId})`,
        hotspotId: locationId,
      });

      res.status(200).json({
        success: true,
        action: "created",
        label: name,
        value: newHotspot._id.toString(),
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
