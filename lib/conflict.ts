type ContentFields = {
  about?: string;
  birding?: string;
  plan?: string;
  restrooms?: string;
};

function fieldConflicts(group: ContentFields, hotspot: ContentFields, key: keyof ContentFields): boolean {
  const g = group[key];
  const h = hotspot[key];
  if (!g || !h) return false;
  if (key === "restrooms" && (g === "Unknown" || h === "Unknown")) return false;
  return g !== h;
}

export function hasConflictingContent(group: ContentFields, hotspot: ContentFields): boolean {
  return (
    fieldConflicts(group, hotspot, "about") ||
    fieldConflicts(group, hotspot, "birding") ||
    fieldConflicts(group, hotspot, "plan") ||
    fieldConflicts(group, hotspot, "restrooms")
  );
}

export function hasFieldConflict(group: ContentFields, hotspot: ContentFields, key: keyof ContentFields): boolean {
  return fieldConflicts(group, hotspot, key);
}
