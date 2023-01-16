import Hotspot from "models/Hotspot";
import connect from "lib/mongo";

export default async function handler(req: any, res: any) {
  try {
    await connect();
    //await Hotspot.deleteMany({ name: /^stakeout/i });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
}
