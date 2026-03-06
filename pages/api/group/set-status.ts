import connect from "lib/mongo";
import Group from "models/Group";
import secureApi from "lib/secureApi";

const VALID_STATUSES = ["unreviewed", "retired", "needsPrimary", "migrationReady"];

export default secureApi(async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, status } = req.body;

  if (!id || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Invalid request" });
  }

  await connect();

  const group = await Group.findById(id, "_id");
  if (!group) {
    return res.status(404).json({ error: "Group not found" });
  }

  await Group.updateOne(
    { _id: id },
    {
      isRetired: status === "retired",
      isMigrationReady: status === "migrationReady",
      needsPrimaryHotspot: status === "needsPrimary",
    }
  );

  res.status(200).json({ success: true });
}, "admin");
