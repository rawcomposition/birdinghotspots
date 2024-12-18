import readline from "readline";
import RegionData from "../data/regions.json";
import fs from "fs";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(`Enter region code: `, (regionCode: string) => {
  const codePieces = regionCode.split("-");
  let subregions: any[] = [];

  const data = RegionData as any[];

  if (codePieces.length === 1) {
    const countryCode = codePieces[0];
    const country = data.find((region) => region.code === countryCode);
    subregions = country?.subregions;
  } else if (codePieces.length === 2) {
    const countryCode = codePieces[0];
    const stateCode = `${countryCode}-${codePieces[1]}`;
    const country = data.find((region) => region.code === countryCode);
    const state = country?.subregions?.find((region: any) => region.code === stateCode);
    subregions = state?.subregions;
  }

  const mapFile = `components/region-maps/${regionCode}.tsx`;
  const mapFileContent = fs.readFileSync(mapFile, "utf8");
  let newMapFileContent = mapFileContent;
  for (const subregion of subregions) {
    newMapFileContent = newMapFileContent.replace(`<text>${subregion.code}</text>`, `<text>${subregion.name}</text>`);
  }
  fs.writeFileSync(mapFile, newMapFileContent);
  console.log("Map migrated successfully");
  rl.close();
});
