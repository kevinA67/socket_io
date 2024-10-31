import { useEffect, useState } from "react";
import { TCustomerShare } from "../Types";
import { Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";

const useClient = (socket: Socket<DefaultEventsMap, DefaultEventsMap>) => {
  const [customerShare, setCustomerShare] = useState<TCustomerShare>({
    clienteId: 0,
    referencia: "",
    monto: 0,
    cuota: 0,
    fecha: new Date().toLocaleDateString("es-ES"),
  });
  const [dataTable, setDataTable] = useState("");

  const headers = [
    { id: "clienteId", name: "ID Cliente:", disableStatus: false },
    { id: "referencia", name: "Referencia:", disableStatus: false },
    { id: "monto", name: "Monto a pagar:", disableStatus: false },
    { id: "cuota", name: "# Cuota:", disableStatus: false },
    { id: "fecha", name: "Fecha actual:", disableStatus: true },
  ];

  useEffect(() => {
    socket.on("consultar", (data: string) => {
      console.log(data)
      setDataTable(data);
    });

    socket.on("pagoCuota", (data: string) => {
      console.log("Respuesta", data);
      socket.emit("consultarPago", customerShare.clienteId);
    });

    socket.on("revertirPago", (data: string) => {
      console.log("Respuesta", data);
      socket.emit("consultarPago", customerShare.clienteId);
    });

    return () => {
      socket.off("consultar");
      socket.off("pagoCuota");
      socket.off("revertirPago");
    };
  }, []);

  const handleConsult = () => {
    socket.emit("consultarPago", customerShare.clienteId);
  };

  const formatearNumero = (num: number, length: number) => {
    return String(num).padStart(length, "0");
  };

  const handlePay = () => {
    const cliente = formatearNumero(customerShare.clienteId, 8);
    const cuota = formatearNumero(customerShare.cuota, 2);
    const fecha = `${customerShare.fecha.substring(
      6
    )}${customerShare.fecha.substring(3, 5)}${customerShare.fecha.substring(
      0,
      2
    )}`;
    const monto = formatearNumero(Math.round(customerShare.monto * 100), 8);

    socket.emit("pagarCuota", `$${cliente}$${cuota}$${fecha}$${monto}`);
  };

  const handleRevert = () => {
    console.log("Hola revertir");
    const cliente = formatearNumero(customerShare.clienteId, 8);
    const referencia = customerShare.referencia

    socket.emit("revertirPago", `${cliente}${referencia}`);
  };

  return {
    headers,
    customerShare,
    setCustomerShare,
    handleConsult,
    handlePay,
    handleRevert,
    dataTable,
  };
};

export default useClient;
