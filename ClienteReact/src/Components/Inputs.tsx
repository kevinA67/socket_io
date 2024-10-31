import { Dispatch, ChangeEvent } from "react";
import { TCustomerShare } from "../Types";

type appProps = {
  valueDefualt: [string, string | number | Date];
  id: string;
  name: string;
  setCustomerShare: Dispatch<React.SetStateAction<TCustomerShare>>;
  disableStatus: boolean;
};

const Inputs = ({
  valueDefualt,
  id,
  name,
  setCustomerShare,
  disableStatus,
}: appProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCustomerShare((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  return (
    <div className="flex py-4 justify-between">
      <label htmlFor={id} className="text-white px-5">
        {name}
      </label>
      <input
        id={id}
        type={id === "fecha" || id === "referencia" ? "text" : "number"}
        className="ml-4 bg-slate-300"
        onChange={handleChange}
        disabled={disableStatus}
        value={valueDefualt[1].toString()}
      />
    </div>
  );
};

export default Inputs;
