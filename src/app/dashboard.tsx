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

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { db } from "../firebase/config";

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

  const eliminarEvento = async (id: string) => {
    const confirmar = confirm("¿Seguro que deseas eliminar este evento?");

    if (!confirmar) return;

    await deleteDoc(doc(db, "eventos", id));
    Alert.alert("Éxito", "Evento eliminado correctamente");
    cargarEventos();
  };

  useEffect(() => {
    const cargarDatos = async () => {
      const rolGuardado = await AsyncStorage.getItem("rol");
      setRol(rolGuardado || "");
      cargarEventos();
    };

    cargarDatos();
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

      <View style={styles.menu}>
        {rol === "organizador" && (
          <TouchableOpacity
            style={styles.botonCrear}
            onPress={() => router.push("/crear-evento")}
          >
            <Text style={styles.textoBoton}>+ Crear evento</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.botonHistorial}
          onPress={() => router.push("/historial")}
        >
          <Text style={styles.textoBoton}>Historial</Text>
        </TouchableOpacity>

        {rol === "organizador" && (
          <TouchableOpacity
            style={styles.botonEstadisticas}
            onPress={() => router.push("/estadisticas")}
          >
            <Text style={styles.textoBoton}>Estadísticas</Text>
          </TouchableOpacity>
        )}
      </View>

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
  menu: {
    marginBottom: 20,
  },
  botonCrear: {
    backgroundColor: "#2563EB",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  botonHistorial: {
    backgroundColor: "#7C3AED",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  botonEstadisticas: {
    backgroundColor: "#F59E0B",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
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
    borderRadius: 18,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
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
    padding: 11,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  botonEditar: {
    backgroundColor: "#0D9488",
    padding: 11,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  botonEliminar: {
    backgroundColor: "#EF4444",
    padding: 11,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  textoBoton: {
    color: "#fff",
    fontWeight: "bold",
  },
  vacio: {
    textAlign: "center",
    color: "#64748B",
    marginBottom: 15,
  },
});