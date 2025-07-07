import connect from "lib/mongo";
import Revision from "models/Revision";
import { Revision as RevisionType } from "lib/types";
import { getRegion } from "lib/localData";
import diff from "node-htmldiff";
import { getSubscriptions } from "lib/mongo";
import secureApi from "lib/secureApi";
import { canEdit } from "lib/helpers";

export default secureApi(async (req, res, token) => {
  const { search, status, skip, region }: any = req.body;
  const limit = status === "pending" ? undefined : 20;

  try {
    await connect();
    const subscriptions = await getSubscriptions(token.uid);

    let query: any = { status };

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

    const [revisions, total] = await Promise.all([
      Revision.find(query)
        .sort({ createdAt: -1 })
        .limit(limit || 0)
        .skip(skip || 0)
        .lean(),
      Revision.countDocuments(query),
    ]);

    const formatDiff = (oldValue?: string, newValue?: string) => {
      if (newValue === undefined) return null; //No edit made for this field
      if (oldValue === undefined) return newValue; //Legacy revision with no old value saved
      return {
        old: oldValue,
        new: newValue,
        diff: diff(oldValue, newValue),
      };
    };

    const results = revisions.map((it) => {
      const regionCode = it.countyCode || it.stateCode || it.countryCode;
      const region = getRegion(regionCode);
      const formatted = {
        ...it,
        hasMultiple:
          status === "pending"
            ? revisions.filter((rev: RevisionType) => rev.locationId === it.locationId).length > 1
            : false,
        locationName: region?.detailedName || regionCode,
        plan: formatDiff(it.plan?.old, it.plan?.new),
        birding: formatDiff(it.birding?.old, it.birding?.new),
        about: formatDiff(it.about?.old, it.about?.new),
      };
      return formatted;
    });

    res.status(200).json({ success: true, results, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
