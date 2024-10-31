import { useMemo, MouseEvent } from "react";
import { TCustomerShare } from "../Types";

type appProps = {
  dataTable: string;
  setCustomerShare: React.Dispatch<React.SetStateAction<TCustomerShare>>;
};

const Table = ({ dataTable, setCustomerShare }: appProps) => {
  const datos = useMemo(() => {
    const filas = dataTable.slice(0, -1).split("+");
    const columnas = filas.map((item) => item.slice(1).split("$"));

    return columnas;
  }, [dataTable]);

  const handleClickRow = (
    e: MouseEvent<HTMLTableRowElement, globalThis.MouseEvent>
  ) => {
    const row = e.currentTarget;
    const columns = row.querySelectorAll("td");

    setCustomerShare((prev) => ({
      ...prev,
      clienteId: Number(columns[0].textContent),
      referencia: columns[6].textContent ?? "",
      monto: Number(columns[2].textContent),
      cuota: Number(columns[1].textContent),
    }));
  };

  return (
    <>
      <table className="bg-white w-full mx-20 text-center border">
        <thead>
          <tr>
            <th className="border border-gray-600">ID Cliente</th>
            <th className="border border-gray-600">Couta</th>
            <th className="border border-gray-600">Monto</th>
            <th className="border border-gray-600">Fecha cuota</th>
            <th className="border border-gray-600">Estado</th>
            <th className="border border-gray-600">Fecha pago</th>
            <th className="border border-gray-600">Referencia</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((item, index) => (
            <tr
              key={index}
              className="hover:bg-lime-200 cursor-pointer"
              onClick={handleClickRow}
            >
              {item.map((value, index) => (
                <td key={index} className="border border-gray-600">
                  {index === 2
                    ? Number(value) / 100
                    : index === 3 || index === 5
                    ? `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(
                        4
                      )}`
                    : value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default Table;
