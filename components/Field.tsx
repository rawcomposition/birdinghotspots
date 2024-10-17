import Help from "components/Help";

type InputProps = {
  label: string;
  help?: string;
  required?: boolean;
  children: React.ReactNode;
};

const Field = ({ label, help, required, children }: InputProps) => {
  return (
    <div className="flex-1">
      <label className="text-gray-500 font-bold">
        {label}
        {required && <span className="text-red-600 font-normal ml-px">*</span>} {help && <Help text={help} />}
        <br />
        {children}
      </label>
    </div>
  );
};

export default Field;
