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
  newMapFileContent = transformPathsToLinks(newMapFileContent);
  for (const subregion of subregions) {
    newMapFileContent = newMapFileContent.replace(`<text>${subregion.code}</text>`, `<text>${subregion.name}</text>`);
  }
  fs.writeFileSync(mapFile, newMapFileContent);
  console.log("Map migrated successfully");
  rl.close();
});

export function transformPathsToLinks(input: string): string {
  // Match each <path ...>...</path> OR self-closing <path .../>
  const pathElementRe = /<path\b[^>]*?(?:\/>|>[\s\S]*?<\/path>)/g;

  return input.replace(pathElementRe, (full) => {
    // Extract d="..." or d='...'
    const dMatch = full.match(/\bd\s*=\s*(?:"([^"]+)"|'([^']+)')/);
    const dValue = dMatch?.[1] ?? dMatch?.[2];
    if (!dValue) return full; // no d -> skip

    // Extract class="..." or class='...'
    const classMatch = full.match(/\bclass\s*=\s*(?:"([^"]+)"|'([^']+)')/);
    const classValue = classMatch?.[1] ?? classMatch?.[2];
    if (!classValue) return full; // no class -> skip

    // Find the token immediately after "datamaps-subunit"
    // e.g. "datamaps-subunit GB-ENG more-classes" => VARIABLE2 = "GB-ENG"
    const subunitMatch = classValue.match(/\bdatamaps-subunit\b(?:\s+([^\s"'>/]+))/);
    const variable2 = subunitMatch?.[1];
    if (!variable2) return full; // no VARIABLE2 right after subunit -> skip

    // Build replacement
    const replacement = `<Link href="/region/${variable2}" {...linkProps}>
  <path {...pathProps} d="${dValue}" />
  <text>${variable2}</text>
</Link>`;

    return replacement;
  });
}
