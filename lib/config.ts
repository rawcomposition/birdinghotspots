export const ENABLE_LEGACY_UPLOADS = false;
export const ENABLE_SUGGESTIONS = false;
export const ENABLE_EDITOR_WRITE = false;
export const ENABLE_ADMIN_WRITE = true;
export const ENABLE_SYNC = false;
export const ENABLE_PHOTO_SYNC = false;
export const ENABLE_ANALYTICS_LOGGING = false;

export const isWriteFrozen = (role?: string) => {
  if (!role) return false;
  if (role === "admin") return !ENABLE_ADMIN_WRITE;
  return !ENABLE_EDITOR_WRITE;
};

export const assertWriteEnabled = (res: any, role?: string) => {
  if (role === "admin" && !ENABLE_ADMIN_WRITE) {
    res.status(403).json({ error: "Write operations are currently disabled" });
    return false;
  }
  if (role !== "admin" && !ENABLE_EDITOR_WRITE) {
    res.status(403).json({ error: "Write operations are currently disabled" });
    return false;
  }
  return true;
};

export const PLAN_SECTION_HELP_TEXT = `Everything you need to know before you go. This section provides logistical information to plan an informed visit, including entrance fees, permit requirements, operating hours, directions, parking details, amenities, and accessibility notes. Include key details visitors should be aware of ahead of time—such as special rules and seasonal closures—that could impact their visit.`;

export const BIRDING_SECTION_HELP_TEXT = `Tips and strategies to make the most of the birding experience. This section offers guidance for where to go within the site, including notable trails, key habitats, and important routes or stops. Share details about species of interest, where to find them, and the best times of day or year to visit. Offer advice for birders to optimize their time and enjoy the site to its fullest.`;

export const ABOUT_SECTION_HELP_TEXT = `Broader context and background information to deepen readers' understanding and appreciation of the Hotspot. Share details about the site’s history, ownership and management, conservation efforts, partnerships, and additional resources. Use this section to tell the Hotspot’s story, highlight its importance, and share insightful details that aren’t directly related to trip planning or birding.`;
