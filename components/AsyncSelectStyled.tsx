import AsyncSelect from "react-select/async";

const AsyncSelectStyled = (props: any) => {
  return (
    <AsyncSelect
      styles={{
        input: (base) => ({
          ...base,
          "input:focus": { boxShadow: "none" },
        }),
        singleValue: (base) => ({
          ...base,
          color: "#555",
          fontWeight: "normal",
        }),
        menuList: (base) => ({
          ...base,
          color: "#555",
          fontWeight: "normal",
        }),
        control: (base, state) => ({
          ...base,
          borderColor: state.isFocused ? "rgb(165, 180, 252)" : "#e5e7eb",
          outline: "none",
          boxShadow: state.isFocused
            ? "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(199, 210, 254, 0.5) 0px 0px 0px 3px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px"
            : "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        }),
        menu: (base) => ({
          ...base,
          zIndex: 100,
        }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      }}
      {...props}
    />
  );
};

export default AsyncSelectStyled;
