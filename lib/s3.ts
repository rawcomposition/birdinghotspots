export const region = "us-east-005";
export const endpoint = "https://s3.us-east-005.backblazeb2.com";
export const legacyEndpoint = "https://s3.us-east-1.wasabisys.com";
export const bucket = "birdinghotspots";

export const getFileUrl = (key?: string) => {
  if (!key) return undefined;
  if (key.startsWith("http")) return key.replace(legacyEndpoint, endpoint);
  return `https://${endpoint}/${bucket}/${key}`;
};
