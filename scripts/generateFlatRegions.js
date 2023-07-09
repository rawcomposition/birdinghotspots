const path = require("path");
const fs = require("fs");
const data = require("../data/regions.json");

function flattenRegions(regions, parentName = "") {
  const flattened = [];

  regions.forEach((region) => {
    const { code, name, subregions } = region;
    const detailedName = parentName ? `${name}, ${parentName.replace("United States", "US")}` : name;

    flattened.push({
      code,
      name: detailedName,
    });

    if (subregions && subregions.length > 0) {
      const subFlattened = flattenRegions(subregions, detailedName, code);
      flattened.push(...subFlattened);
    }
  });

  return flattened;
}

const flattened = flattenRegions(data);

fs.writeFileSync(path.join(__dirname, "../data/flat-regions.json"), JSON.stringify(flattened, null, 2));
