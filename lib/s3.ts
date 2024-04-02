export const region = "us-east-005";
export const endpoint = "https://nyc3.digitaloceanspaces.com";
export const cdnEndpoint = "https://birdinghotspots.nyc3.cdn.digitaloceanspaces.com";
export const legacyEndpoint = "https://s3.us-east-1.wasabisys.com";
export const bucket = "birdinghotspots";

export const getFileUrl = (key?: string) => {
  if (!key) return undefined;
  if (key.startsWith("http")) return key.replace(legacyEndpoint, cdnEndpoint);
  return `${endpoint}/${bucket}/${key}`;
};
