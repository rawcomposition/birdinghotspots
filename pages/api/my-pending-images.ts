import connect from "lib/mongo";
import Hotspot from "models/Hotspot";
import Profile from "models/Profile";
import { getRegion } from "lib/localData";
import secureApi from "lib/secureApi";

export default secureApi(async (req, res, token) => {
  const { status, skip, region }: any = req.body;
  const limit = 20;

  try {
    await connect();
    const profile = await Profile.findOne({ uid: token.uid });
    if (!profile) throw new Error("Profile not found");
    if (!profile.email) throw new Error("Email not found");

    let query: any = { "images.email": profile?.email };

    if (status === "migrated") {
      query["images.isMigrated"] = true;
    }

    if (region) {
      if (region.split("-").length === 1) {
        query.countryCode = region;
      } else if (region.split("-").length === 2) {
        query.stateCode = region;
      } else if (region.split("-").length === 3) {
        query.countyCode = region;
      }
    }

    const [hotspots, total, imageTotalResult] = await Promise.all([
      Hotspot.find(query)
        .sort({ name: 1 })
        .limit(limit || 0)
        .skip(skip || 0)
        .lean(),
      Hotspot.countDocuments(query),
      Hotspot.aggregate([
        {
          $addFields: {
            matchingImages: {
              $filter: {
                input: "$images",
                as: "image",
                cond: {
                  $and: [
                    { $eq: ["$$image.email", profile?.email] },
                    { $ne: ["$$image.isMap", true] },
                    { $ne: ["$$image.isStreetview", true] },
                    status === "pending"
                      ? { $ne: ["$$image.isMigrated", true] }
                      : { $eq: ["$$image.isMigrated", true] },
                  ],
                },
              },
            },
          },
        },
        {
          $addFields: {
            matchingImageCount: { $size: "$matchingImages" },
          },
        },
        {
          $group: {
            _id: null,
            totalMatchingImages: { $sum: "$matchingImageCount" },
          },
        },
        {
          $project: {
            _id: 0,
            totalCount: "$totalMatchingImages",
          },
        },
      ]),
    ]);

    const results = hotspots.map((it) => {
      const regionCode = it.countyCode || it.stateCode || it.countryCode;
      const region = getRegion(regionCode);
      const formatted = {
        ...it,
        locationName: region?.detailedName || regionCode,
      };
      const filteredImages = it.images?.filter(
        (image) =>
          image.email === profile?.email &&
          !image.isMap &&
          (status === "migrated" ? image.isMigrated : !image.isMigrated)
      );
      return {
        ...formatted,
        images: filteredImages || [],
      };
    });

    res.status(200).json({ success: true, results, total, imageTotal: imageTotalResult[0].totalCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
