import React from "react";

export default function LicenseNotice() {
  const [show, setShow] = React.useState(false);
  return (
    <div className="text-xs text-gray-500 my-4">
      <p>
        All photos are released into the <strong className="font-medium">public domain</strong> unless otherwise noted.
        &nbsp;
        {!show && (
          <button type="button" className="text-[#2275d7] font-medium" onClick={() => setShow(true)}>
            Read more.
          </button>
        )}
      </p>
      {show && (
        <>
          <p className="mt-2">
            If you don&apos;t have permission to release an image into the public domain, indicate the copyright or
            appropriate creative commons license in the <strong>By</strong> field using one of the following examples:
          </p>
          <ul className="ml-4 list-disc my-2 leading-5">
            <li>
              <span className="rounded bg-slate-200 px-1.5 py-[1px] text-black">John Doe (all rights reserved)</span>
              &nbsp;or&nbsp;
              <span className="rounded bg-slate-200 px-1.5 py-[1px] text-black">© John Doe</span>
            </li>
            <li>
              <span className="rounded bg-slate-200 px-1.5 py-[1px] text-black">John Doe (CC BY 4.0 license)</span>
            </li>
          </ul>
          <p>
            There are many{" "}
            <a
              href="https://creativecommons.org/about/cclicenses/"
              className="text-[#2275d7]"
              target="_blank"
              rel="noreferrer"
            >
              Creative Commons licenses
            </a>
            , use the one the image was published under.
          </p>
        </>
      )}
    </div>
  );
}
