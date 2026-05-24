import { useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { useRouter } from "expo-router";
import { auth, db } from "../../firebase/config";
import { colors } from "../../styles/theme";

type HistorialItem = {
  id: string;
  eventoId: string;
  usuarioEmail: string;
  confirmado: boolean;
  titulo: string;
  fecha: string;
  hora: string;
  ubicacion: string;
};

export default function Historial() {
  const router = useRouter();
  const [historial, setHistorial] = useState<HistorialItem[]>([]);

  const obtenerFechaLocal = (fecha: string) => {
    const [year, month, day] = fecha.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const cargarHistorial = async () => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "asistencias"),
      where("usuarioEmail", "==", auth.currentUser.email)
    );

    const resultado = await getDocs(q);

    const lista = await Promise.all(
      resultado.docs.map(async (documento) => {
        const asistencia = documento.data();

        const eventoRef = doc(db, "eventos", asistencia.eventoId);
        const eventoSnap = await getDoc(eventoRef);

        const evento = eventoSnap.exists() ? eventoSnap.data() : {};

        return {
          id: documento.id,
          eventoId: asistencia.eventoId,
          usuarioEmail: asistencia.usuarioEmail,
          confirmado: asistencia.confirmado,
          titulo: evento.titulo || "Evento no encontrado",
          fecha: evento.fecha || "Sin fecha",
          hora: evento.hora || "Sin hora",
          ubicacion: evento.ubicacion || "Sin ubicación",
        };
      })
    );

    setHistorial(lista);
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  const historialProximo = historial.filter((item) => {
    if (item.fecha === "Sin fecha") return false;

    const fechaEvento = obtenerFechaLocal(item.fecha);
    fechaEvento.setHours(0, 0, 0, 0);

    return fechaEvento >= hoy;
  });

  const historialPasado = historial.filter((item) => {
    if (item.fecha === "Sin fecha") return false;

    const fechaEvento = obtenerFechaLocal(item.fecha);
    fechaEvento.setHours(0, 0, 0, 0);

    return fechaEvento < hoy;
  });

  const renderHistorial = ({ item }: { item: HistorialItem }) => {
    const fechaEvento = obtenerFechaLocal(item.fecha);
    fechaEvento.setHours(0, 0, 0, 0);

    const esPasado = fechaEvento < hoy;

    return (
      <View style={styles.card}>
        <View
          style={[
            styles.badge,
            esPasado ? styles.badgePasado : styles.badgeProximo,
          ]}
        >
          <Text
            style={[
              styles.badgeTexto,
              esPasado ? styles.badgeTextoPasado : styles.badgeTextoProximo,
            ]}
          >
            {esPasado ? "Evento asistido" : "Próxima asistencia"}
          </Text>
        </View>

        <Text style={styles.cardTitulo}>{item.titulo}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.texto}>📅 {item.fecha}</Text>
          <Text style={styles.texto}>🕒 {item.hora}</Text>
          <Text style={styles.texto}>📍 {item.ubicacion}</Text>
          <Text style={styles.texto}>👤 {item.usuarioEmail}</Text>
        </View>

        <Text style={styles.estado}>
          {item.confirmado
            ? "Asistencia confirmada"
            : "Asistencia pendiente"}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Historial</Text>

      <Text style={styles.subtitulo}>
        Próximas asistencias y eventos completados
      </Text>

      <Text style={styles.seccion}>⏳ Próximas asistencias</Text>

      <FlatList
        data={historialProximo}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={renderHistorial}
        ListEmptyComponent={
          <Text style={styles.vacio}>
            No tienes próximas asistencias confirmadas.
          </Text>
        }
      />

      <Text style={styles.seccion}>✅ Eventos asistidos</Text>

      <FlatList
        data={historialPasado}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={renderHistorial}
        ListEmptyComponent={
          <Text style={styles.vacio}>
            No tienes eventos asistidos registrados.
          </Text>
        }
      />

      <TouchableOpacity
        style={styles.botonVolver}
        onPress={() => router.push("/tabs/dashboard")}
      >
        <Text style={styles.textoBotonVolver}>Volver al inicio</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: colors.text,
    marginTop: 35,
  },
  subtitulo: {
    textAlign: "center",
    color: colors.muted,
    marginBottom: 25,
  },
  seccion: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 12,
    color: "#0F172A",
  },
  card: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 22,
    marginBottom: 15,
    elevation: 4,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  badgeProximo: {
    backgroundColor: "#DBEAFE",
  },
  badgePasado: {
    backgroundColor: "#DCFCE7",
  },
  badgeTexto: {
    fontWeight: "bold",
  },
  badgeTextoProximo: {
    color: colors.primary,
  },
  badgeTextoPasado: {
    color: colors.success,
  },
  cardTitulo: {
    fontSize: 21,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: "#F8FAFC",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
  },
  texto: {
    fontSize: 15,
    marginBottom: 6,
    color: colors.muted,
  },
  estado: {
    fontWeight: "bold",
    color: colors.success,
  },
  vacio: {
    textAlign: "center",
    color: colors.muted,
    marginBottom: 15,
  },
  botonVolver: {
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  textoBotonVolver: {
    color: colors.primary,
    fontWeight: "bold",
  },
});