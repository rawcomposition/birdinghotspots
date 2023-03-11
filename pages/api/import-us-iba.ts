import secureApi from "lib/secureApi";
import IBAs from "../../us-iba.json";
//import CompressedIBAs from "../../us-iba-compressed.json";
import Iba from "models/Iba";
import connect from "lib/mongo";

//Source: https://library-audubon.hub.arcgis.com/datasets/9217fd74cf8b4e47bd2d77720a757873/explore?layer=0&location=23.698881%2C65.812499%2C3.58
//CompressedIBAs takes the above source and downsizes to 30% or so using https://mapshaper.org/
//Before import, fix items missing STATE_DB value

export default secureApi(async (req, res, token) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(500).json({ success: false });
  }

  await connect();
  const existing = await Iba.find({ countryCode: "US" }, "_id");
  const existingIds = existing.map((it) => it._id);

  const formatted: any[] = [];

  //@ts-ignore
  IBAs.features.forEach((iba, index) => {
    const { properties } = iba;
    if (existingIds.includes(`US${properties.SITE_ID}`)) return;
    if (!properties.PUBLIC_DB || !properties.SITE_ID) return;
    const formattedIndex = formatted.findIndex((it) => it.id === properties.SITE_ID);
    //@ts-ignore
    const geometry = CompressedIBAs.features[index].geometry;
    if (formattedIndex > -1) {
      formatted[formattedIndex].objects.push(geometry);
    } else {
      formatted.push({
        name: properties.SITE_NAME?.trim(),
        _id: `US${properties.SITE_ID}`,
        globalId: properties.GlobalID,
        stateCode: properties.STATE_DB,
        countryCode: "US",
        ebirdUrl: properties.EBIRD_LINK?.trim(),
        lat: properties.LATITUDE,
        lng: properties.LONGITUDE,
        website: properties.WEBSITE_1?.trim(),
        objects: [geometry],
      });
    }
  });

  const badIds = [];

  for (const { objects, ...iba } of formatted) {
    try {
      await Iba.create({
        ...iba,
        polygon: objects.length === 1 ? objects[0] : null,
        location: {
          type: "Point",
          coordinates: [iba.lng, iba.lat],
        },
      });
    } catch (e) {
      badIds.push(iba._id);
      console.log("Error creating IBA", iba.stateCode);
    }
  }
  console.log("Bad IDs", badIds.length);
  console.log(badIds);

  res.status(200).json({ success: true });
}, "admin");
