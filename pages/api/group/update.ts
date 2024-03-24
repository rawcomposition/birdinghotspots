import connect from "lib/mongo";
import Group from "models/Group";
import Hotspot from "models/Hotspot";
import Logs from "models/Log";
import secureApi from "lib/secureApi";
import { canEdit } from "lib/helpers";
import dayjs from "dayjs";
import { getStaticMap } from "lib/helpers";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

export default secureApi(async (req, res, token) => {
  const { id, data } = req.body;

  const hotspots = await Hotspot.find({ _id: { $in: data.hotspots } }, [
    "-_id",
    "stateCode",
    "countyCode",
    "species",
    "lat",
    "lng",
  ]).lean();
  const allStateCodes: string[] = hotspots.map((hotspot: any) => hotspot.stateCode);
  const stateCodes = [...new Set(allStateCodes)].filter(Boolean);
  const countyCodes: string[] = [];

  hotspots.forEach((hotspot: any) => {
    if (hotspot.countyCode && !countyCodes.includes(hotspot.countyCode)) {
      countyCodes.push(hotspot.countyCode);
    }
  });

  if (!canEdit(token, !!data?.stateCodes?.length ? data.stateCodes : data.countryCode)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await connect();
    const group = await Group.findOne({ _id: id }, ["-_id", "hotspots"]);
    const removedHotspots = group.hotspots.filter((it: string) => !data.hotspots.includes(it.toString()));

    const s3 = new S3Client({
      credentials: {
        accessKeyId: process.env.S3_KEY || "",
        secretAccessKey: process.env.S3_SECRET || "",
      },
      region: "us-east-005",
      endpoint: "https://s3.us-east-005.backblazeb2.com",
    });

    const uploadUrlToS3 = async (url: string, key: string) => {
      const uploadParams = {
        Bucket: "birdinghotspots",
        Key: key,
        ACL: "public-read",
        Body: await fetch(url).then((res) => res.arrayBuffer()),
      };
      // @ts-ignore
      await s3.send(new PutObjectCommand(uploadParams));
    };

    const url = getStaticMap(hotspots as any);
    const filename = `groupmap${uuidv4()}.jpg`;

    await uploadUrlToS3(url, filename);
    const mapImgUrl = `https://s3.us-east-005.backblazeb2.com/birdinghotspots/${filename}`;

    const updatedAt = dayjs().format();
    await Promise.all([
      await Group.updateOne(
        { _id: id },
        { ...data, stateCodes, countyCodes, updatedAt, mapImgUrl, hotspotCount: data.hotspots.length }
      ),
      await Hotspot.updateMany({ _id: { $in: data.hotspots } }, { $addToSet: { groupIds: id } }),
      await Hotspot.updateMany({ _id: { $in: removedHotspots } }, { $pull: { groupIds: id } }),
    ]);

    try {
      await Logs.create({
        user: token.name,
        uid: token.uid,
        type: "edit_group",
        message: `edited group: ${data.name}`,
        hotspotId: data.locationId,
      });
    } catch (error) {}

    res.status(200).json({ success: true, url: data.url });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}, "editor");
