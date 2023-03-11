import Help from "components/Help";

type InputProps = {
  label: string;
  help?: string;
  children: React.ReactNode;
};

const Field = ({ label, help, children }: InputProps) => {
  return (
    <div className="flex-1">
      <label className="text-gray-500 font-bold">
        {label} {help && <Help text={help} />}
        <br />
        {children}
      </label>
    </div>
  );
};

export default Field;
