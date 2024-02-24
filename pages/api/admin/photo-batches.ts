import connect from "lib/mongo";
import PhotoBatch from "models/PhotoBatch";
import { getRegion } from "lib/localData";
import { getSubscriptions } from "lib/mongo";
import secureApi from "lib/secureApi";
import { canEdit } from "lib/helpers";

export default secureApi(async (req, res, token) => {
  const { search, status, skip, region }: any = req.body;
  const limit = status === "pending" ? undefined : 20;

  try {
    await connect();
    const subscriptions = await getSubscriptions(token.uid);

    let query: any = { isReviewed: status === "pending" ? false : true };

    if (region && canEdit(token, region)) {
      if (region.split("-").length === 1) {
        query.countryCode = region;
      } else if (region.split("-").length === 2) {
        query.stateCode = region;
      } else if (region.split("-").length === 3) {
        query.countyCode = region;
      }
    } else if (token.role !== "admin") {
      const regions = subscriptions.length === 0 ? token.regions || [] : subscriptions;
      const countries = regions.filter((it) => it.split("-").length === 1);
      const states = regions.filter((it) => it.split("-").length === 2);
      const counties = subscriptions.filter((it) => it.split("-").length === 3);
      query = {
        ...query,
        $or: [
          { countryCode: { $in: countries || [] } },
          { stateCode: { $in: states || [] } },
          { countyCode: { $in: counties || [] } },
        ],
      };
    }

    if (search) {
      query = {
        ...query,
        $or: [
          { locationId: search },
          { name: { $regex: search, $options: "i" } },
          { by: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    const [uploads, total] = await Promise.all([
      PhotoBatch.find(query)
        .sort({ createdAt: -1 })
        .limit(limit || 0)
        .skip(skip || 0)
        .lean(),
      PhotoBatch.countDocuments(query),
    ]);

    const results = uploads.map((it) => {
      const regionCode = it.countyCode || it.stateCode || it.countryCode;
      const region = getRegion(regionCode);
      const formatted = {
        ...it,
        locationName: region?.detailedName || regionCode,
      };
      return formatted;
    });

    res.status(200).json({ success: true, results, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
