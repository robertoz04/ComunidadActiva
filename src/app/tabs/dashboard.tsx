import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { auth, db } from "../../firebase/config";

type Evento = {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  ubicacion: string;
};

export default function Dashboard() {
  const router = useRouter();

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [rol, setRol] = useState("");
  const [logueado, setLogueado] = useState(false);

  const obtenerFechaLocal = (fecha: string) => {
    const [year, month, day] = fecha.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const cargarEventos = async () => {
    const q = query(collection(db, "eventos"), orderBy("creadoEn", "desc"));
    const resultado = await getDocs(q);

    const lista = resultado.docs.map((documento) => ({
      id: documento.id,
      ...documento.data(),
    })) as Evento[];

    setEventos(lista);
  };

  const cerrarSesion = async () => {
    await auth.signOut();
    await AsyncStorage.removeItem("rol");
    await AsyncStorage.removeItem("email");
    setRol("");
    setLogueado(false);
    router.replace("/tabs/dashboard");
  };

  const eliminarEvento = async (id: string) => {
    const confirmar = confirm("¿Seguro que deseas eliminar este evento?");
    if (!confirmar) return;

    await deleteDoc(doc(db, "eventos", id));
    Alert.alert("Éxito", "Evento eliminado correctamente");
    cargarEventos();
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setLogueado(!!user);

      if (user) {
        const rolGuardado = await AsyncStorage.getItem("rol");
        setRol(rolGuardado || "usuario");
      } else {
        setRol("");
      }

      cargarEventos();
    });

    return unsub;
  }, []);

  const eventosProximos = eventos.filter((evento) => {
    const fechaEvento = obtenerFechaLocal(evento.fecha);
    fechaEvento.setHours(0, 0, 0, 0);
    return fechaEvento >= hoy;
  });

  const eventosPasados = eventos.filter((evento) => {
    const fechaEvento = obtenerFechaLocal(evento.fecha);
    fechaEvento.setHours(0, 0, 0, 0);
    return fechaEvento < hoy;
  });

  const notificaciones = eventosProximos
    .map((evento) => {
      const fechaEvento = obtenerFechaLocal(evento.fecha);
      fechaEvento.setHours(0, 0, 0, 0);

      const diferenciaDias = Math.ceil(
        (fechaEvento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diferenciaDias === 0) {
        return {
          id: evento.id,
          texto: `🔔 Hoy está programado "${evento.titulo}" a las ${evento.hora}`,
          tipo: "hoy",
        };
      }

      if (diferenciaDias === 1) {
        return {
          id: evento.id,
          texto: `⏰ Mañana está programado "${evento.titulo}" a las ${evento.hora}`,
          tipo: "manana",
        };
      }

      return null;
    })
    .filter((item) => item !== null) as {
    id: string;
    texto: string;
    tipo: string;
  }[];

  const renderEvento = ({ item }: { item: Evento }) => {
    const fechaEvento = obtenerFechaLocal(item.fecha);
    fechaEvento.setHours(0, 0, 0, 0);

    const esPasado = fechaEvento < hoy;

    const diferenciaDias = Math.ceil(
      (fechaEvento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
      <View style={styles.card}>
        <View style={styles.fechaBox}>
          <Text style={styles.fechaTexto}>{item.fecha}</Text>
        </View>

        <View style={styles.infoEvento}>
          <Text style={styles.cardTitulo}>{item.titulo}</Text>
          <Text style={styles.cardTexto}>{item.descripcion}</Text>
          <Text style={styles.cardTexto}>🕒 {item.hora}</Text>
          <Text style={styles.cardTexto}>📍 {item.ubicacion}</Text>

          <Text style={[styles.estado, esPasado && styles.estadoPasado]}>
            {esPasado ? "Evento pasado" : "Próximo evento"}
          </Text>

          {diferenciaDias === 0 && (
            <Text style={styles.recordatorioHoy}>🔔 Este evento es HOY</Text>
          )}

          {diferenciaDias === 1 && (
            <Text style={styles.recordatorioManana}>
              ⏰ Este evento es MAÑANA
            </Text>
          )}

          <TouchableOpacity
            style={styles.botonDetalle}
            onPress={() =>
              router.push({
                pathname: "/detalle-evento",
                params: { id: item.id },
              })
            }
          >
            <Text style={styles.textoBoton}>Ver detalle</Text>
          </TouchableOpacity>

          {rol === "organizador" && (
            <>
              <TouchableOpacity
                style={styles.botonEditar}
                onPress={() =>
                  router.push({
                    pathname: "/editar-evento",
                    params: { id: item.id },
                  })
                }
              >
                <Text style={styles.textoBoton}>Editar evento</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botonEliminar}
                onPress={() => eliminarEvento(item.id)}
              >
                <Text style={styles.textoBoton}>Eliminar evento</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Comunidad Activa</Text>
      <Text style={styles.subtitulo}>Agenda comunitaria</Text>

      <View style={styles.headerActions}>
        {logueado ? (
          <TouchableOpacity style={styles.botonSalir} onPress={cerrarSesion}>
            <Text style={styles.textoSalir}>Cerrar sesión</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.botonLogin}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.textoLogin}>Iniciar sesión para participar</Text>
          </TouchableOpacity>
        )}
      </View>

      {notificaciones.length > 0 && (
        <View style={styles.notificacionesCard}>
          <Text style={styles.notificacionesTitulo}>🔔 Recordatorios</Text>

          {notificaciones.map((notificacion) => (
            <Text
              key={notificacion.id}
              style={[
                styles.notificacionTexto,
                notificacion.tipo === "hoy" && styles.notificacionHoy,
              ]}
            >
              {notificacion.texto}
            </Text>
          ))}
        </View>
      )}

      <Text style={styles.seccionTitulo}>Próximos eventos</Text>

      <FlatList
        data={eventosProximos}
        keyExtractor={(item) => item.id}
        renderItem={renderEvento}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={styles.vacio}>No hay eventos próximos.</Text>
        }
      />

      <Text style={styles.seccionTitulo}>Eventos pasados</Text>

      <FlatList
        data={eventosPasados}
        keyExtractor={(item) => item.id}
        renderItem={renderEvento}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={styles.vacio}>No hay eventos pasados.</Text>
        }
      />

      {rol === "organizador" && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/crear-evento")}
        >
          <Text style={styles.fabTexto}>+</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    padding: 20,
  },
  titulo: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 35,
    color: "#1E293B",
  },
  subtitulo: {
    textAlign: "center",
    color: "#64748B",
    marginBottom: 20,
  },
  headerActions: {
    alignItems: "center",
    marginBottom: 20,
  },
  botonSalir: {
    backgroundColor: "#FEE2E2",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  textoSalir: {
    color: "#DC2626",
    fontWeight: "bold",
  },
  botonLogin: {
    backgroundColor: "#DBEAFE",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  textoLogin: {
    color: "#2563EB",
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    right: 0,
    top: 82,
    width: 58,
    height: 58,
    borderRadius: 30,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
  },
  fabTexto: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "bold",
  },
  notificacionesCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
    marginBottom: 18,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: "#F59E0B",
  },
  notificacionesTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
  },
  notificacionTexto: {
    color: "#92400E",
    fontWeight: "600",
    marginBottom: 6,
  },
  notificacionHoy: {
    color: "#DC2626",
  },
  seccionTitulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E293B",
    marginVertical: 15,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
  },
  fechaBox: {
    width: 90,
    backgroundColor: "#E0F2FE",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    padding: 10,
  },
  fechaTexto: {
    fontWeight: "bold",
    textAlign: "center",
    color: "#0369A1",
  },
  infoEvento: {
    flex: 1,
  },
  cardTitulo: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 6,
  },
  cardTexto: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 4,
  },
  estado: {
    marginTop: 8,
    fontWeight: "bold",
    color: "#16A34A",
  },
  estadoPasado: {
    color: "#DC2626",
  },
  recordatorioHoy: {
    marginTop: 6,
    color: "#DC2626",
    fontWeight: "bold",
  },
  recordatorioManana: {
    marginTop: 6,
    color: "#F59E0B",
    fontWeight: "bold",
  },
  botonDetalle: {
    backgroundColor: "#22C55E",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  botonEditar: {
    backgroundColor: "#0D9488",
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  botonEliminar: {
    backgroundColor: "#EF4444",
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  textoBoton: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  vacio: {
    textAlign: "center",
    color: "#64748B",
    marginBottom: 15,
  },
});