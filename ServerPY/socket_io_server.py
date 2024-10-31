import socketio
import eventlet
import random
import string
import mysql.connector
from mysql.connector import Error

# Crear una instancia de Socket.IO
sio = socketio.Server(cors_allowed_origins="*")

# Crear una aplicación de WSGI
app = socketio.WSGIApp(sio)


# Manejar la conexión de un cliente
@sio.event
def connect(sid, environ):
    print(f"Cliente conectado: {sid}")


# Conexion
def ConexionDB():
    try:
        connection = mysql.connector.connect(
            host="34.42.104.166",
            database="socket",
            user="admin",
            password="",
        )
        return connection
    except Error as ex:
        print(f"Error al conectarse a DB: {ex}")
        return None

# Consultar pago
@sio.event
def consultarPago(sid, num_cliente):
    print("Cliente: ",num_cliente)
    connDB = ConexionDB()
    if connDB:
        print("num_cliente ", num_cliente)
        cursor = connDB.cursor()
        sql = f"SELECT ClienteId, Couta, Monto, FechaCuotaPago, Estado, FechaPago, Referencia  FROM Pagos WHERE ClienteId = {num_cliente}"
        cursor.execute(sql)
        cuotas_pendientes = cursor.fetchall()
        connDB.close()
        trama_salida = ""
        for cuota in cuotas_pendientes:
            print("fecha: ", cuota[5])
            clienteNum = cuota[0]
            cuotaNum = cuota[1]
            monto_str = str(int(cuota[2] * 100)).zfill(9)
            fecha_str = cuota[3].strftime("%d%m%Y")
            estado = cuota[4]
            fecha_pagostr = (
                "--------" if cuota[5] == None else cuota[5].strftime("%d%m%Y")
            )
            referencia = "" if cuota[6] == None else cuota[6]
            trama_salida += f"${clienteNum}${cuotaNum}${monto_str}${fecha_str}${estado}${fecha_pagostr}${referencia}+"
            # sio.send(sid, trama_salida.encode())
        print(trama_salida)
        sio.emit("consultar", trama_salida, room=sid)

    return []


def generar_referencia(longitud):
    caracteres = string.ascii_letters + string.digits
    num_referencia = "".join(random.choice(caracteres) for _ in range(longitud))
    return num_referencia


def PagarCuota(num_cliente, cuota, fecha_afectacion, monto, referencia):
    connDB = ConexionDB()
    if connDB:
        cursor = connDB.cursor()
        sql = f"UPDATE Pagos SET Estado = 'C', FechaPago = '{fecha_afectacion}', Referencia = '{referencia}' WHERE ClienteId = {num_cliente} AND Couta = {cuota}"
        cursor.execute(sql)
        connDB.commit()
        connDB.close()
        return True
    return False

# Pagar cuota
@sio.event
def pagarCuota(sid, data):
    print("metodo de pago: ", data)
    fields = data.split("$")
    cliente_num = int(fields[1])
    cuota = int(fields[2])
    fecha_afectacion = fields[3]
    monto = int(fields[4]) / 100

    print("Número de Cliente:", cliente_num)
    print("Cuota:", cuota)
    print("Fecha de Afectación:", fecha_afectacion)
    print("Monto:", monto)
    referencia = generar_referencia(8)
    response_result = PagarCuota(
        cliente_num, cuota, fecha_afectacion, monto, referencia
    )
    print("pago: ", response_result)
    resp_status = f"00${referencia}" if response_result else "01"
    sio.emit("pagoCuota", resp_status, room=sid)



def ConsultarReferencia(referencia):
    connDB = ConexionDB()
    if connDB:
        cursor = connDB.cursor()
        sql = "SELECT Referencia FROM Pagos WHERE Referencia=%s"
        cursor.execute(sql, (referencia,))
        result = cursor.fetchone()
        connDB.close()
        return result

    return None

def RevertirPago(referencia):
    connDB = ConexionDB()
    if connDB:
        cursor = connDB.cursor()
        sql = "UPDATE Pagos SET Estado='A', Referencia='', FechaPago=NULL WHERE Referencia=%s"
        cursor.execute(sql, (referencia,))
        connDB.commit()
        connDB.close()
        return True

    return False

# Revertir pago
@sio.event
def revertirPago(sid, data):
    print("Revertir pago",data)
    referencia = data[8:16]

    existeReferencia = ConsultarReferencia(referencia)
    print(existeReferencia)
    if existeReferencia != None:
        respuesta = RevertirPago(referencia)
        if respuesta == True:
            trama_salida = "¡Pago revertido con Exito!"
        else:
            trama_salida = "¡Oh no, ha ocurrido un error, porfavor contacta al administrador!"
    else:
        trama_salida = "¡ERROR: No existe ningun pago con esa referencia!"

    sio.emit("pagoCuota", trama_salida, room=sid)


# Ejecutar el servidor
if __name__ == "__main__":
    eventlet.wsgi.server(eventlet.listen(("localhost", 5000)), app)
