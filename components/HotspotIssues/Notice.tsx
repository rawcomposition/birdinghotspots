import { useLocalStorage } from "../../hooks/useLocalStorage";
import XMark from "../../icons/XMark";

export default function HotspotIssuesNotice() {
  const [isDismissed, setIsDismissed] = useLocalStorage("hotspotIssuesNoticeDismissed", false);

  if (isDismissed) {
    return null;
  }

  return (
    <div className="p-2 pl-3 bg-yellow-50 border border-yellow-200 rounded-md mb-8 flex items-center">
      <p className="text-sm text-gray-600">
        <strong>Note:</strong> It may take up to 24 hours for hotspot changes to be reflected on this page.
      </p>
      <button
        onClick={() => setIsDismissed(true)}
        className="text-gray-400 hover:text-gray-600 transition-colors pl-2 pr-1 py-1 ml-auto"
        aria-label="Close notice"
      >
        <XMark className="w-4 h-4" />
      </button>
    </div>
  );
}
