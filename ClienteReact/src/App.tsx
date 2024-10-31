import Button from "./Components/Button";
import Inputs from "./Components/Inputs";
import Table from "./Components/Table";
import useClient from "./Hooks/Client";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const { headers, customerShare, setCustomerShare, handleConsult, handlePay, handleRevert, dataTable } =
    useClient(socket);

  const entradas = Object.entries(customerShare);
  return (
    <div className="bg-gray-900 w-screen h-screen">
      <h1 className="text-4xl text-white text-center py-5">
        Sistemas de pagos por cuotas grupo #2
      </h1>
      <div className="bg-slate-800 h-auto py-5">
        <div className="flex justify-center items-center">
          <div className="flex flex-col w-auto">
            {headers.map((config, index) => (
              <Inputs
                key={config.id}
                id={config.id}
                name={config.name}
                setCustomerShare={setCustomerShare}
                disableStatus={config.disableStatus}
                valueDefualt={entradas[index]}
              />
            ))}
          </div>
          <div className="flex flex-col w-auto pl-10">
            <Button name="Consultar cuotas" handleClick={handleConsult} />
            <Button name="Pagar cuota" handleClick={handlePay} />
            <Button name="Revertir pago" handleClick={handleRevert} />
          </div>
        </div>
      </div>
      <div className="flex justify-center pt-8 w-full">
        <Table dataTable={dataTable} setCustomerShare={setCustomerShare} />
      </div>
    </div>
  );
}

export default App;
