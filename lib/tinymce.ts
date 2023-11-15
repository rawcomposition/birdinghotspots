const gpsModalConfig = (editor: any) => ({
  title: "Link to Google Maps",
  body: {
    type: "panel",
    items: [
      {
        type: "input",
        name: "latlng",
        label: "Enter Lat/Lng (e.g. 40.712,-74.006)",
      },
      {
        type: "input",
        name: "label",
        label: "Label",
      },
    ],
  },
  buttons: [
    {
      type: "cancel",
      name: "closeButton",
      text: "Cancel",
    },
    {
      type: "submit",
      name: "submitButton",
      text: "Insert",
      buttonType: "primary",
    },
  ],
  initialData: {
    label: "View Map",
  },
  onSubmit: (api: any) => {
    const data = api.getData();
    const latlng = data.latlng;
    const label = data.label;

    editor.execCommand(
      "mceInsertContent",
      false,
      `<a href='https://www.google.com/maps/search/?api=1&query=${latlng}' class='map-link mceNonEditable' target='_blank'>${
        label || "View Map"
      }</a>`
    );
    api.close();
  },
});

export const config = {
  menubar: false,
  plugins: "link autoresize lists noneditable",
  toolbar: "bold italic underline bullist link insertgps",
  content_style: `
    body {
      font-family:Helvetica,Arial,sans-serif;
      font-size:14px;
    }
    .map-link {
      display: inline-flex;
      align-items: center;
      padding: 1px 5px 1px 5px;
      color: #333;
      text-decoration: none;
      line-height: 1;
      font-size: 13px;
      font-weight: 500;
      border: solid 1px #d4d7dc;
      background-color: #f3f4f6;
      border-radius: 10px;
      vertical-align: bottom;
    }
    .map-link::before {
      margin-top: 2px;
      content: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="8" style="fill: rgb(194,65,13)" class="icon" viewBox="0 0 384 512"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>');
      margin-right: 4px;
    }`,
  branding: false,
  elementpath: false,
  valid_elements: "p,a[href|rel|target|class],strong/b,em/i,u,strike,br,ul,ol,li,cite", //TODO: Remove cite at a later point
  autoresize_bottom_margin: 0,
  convert_urls: false,
  browser_spellcheck: true,
  formats: {
    underline: { inline: "u", exact: true },
  },
  contextmenu: false,
  setup: (editor: any) => {
    editor.ui.registry.addIcon(
      "marker",
      '<svg xmlns="http://www.w3.org/2000/svg" width="13" viewBox="0 0 384 512"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>'
    );
    editor.ui.registry.addButton("insertgps", {
      icon: "marker",
      onAction: () => editor.windowManager.open(gpsModalConfig(editor)),
    });
  },
};
