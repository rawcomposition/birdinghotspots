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
        control: (base, state) => ({
          ...base,
          borderColor: state.isFocused ? "rgb(165, 180, 252)" : base.borderColor,
          outline: "none",
          boxShadow: state.isFocused
            ? "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(199, 210, 254, 0.5) 0px 0px 0px 3px, rgba(0, 0, 0, 0.05) 0px 1px 2px 0px"
            : base.boxShadow,
        }),
        menu: (base) => ({
          ...base,
          zIndex: 100,
        }),
      }}
      {...props}
    />
  );
};

export default AsyncSelectStyled;
