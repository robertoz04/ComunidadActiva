import { useEffect, useState } from "react";
import {
  FlatList,
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

  const cargarHistorial = async () => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "asistencias"),
      where("usuarioId", "==", auth.currentUser.uid)
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

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Historial</Text>
      <Text style={styles.subtitulo}>
        Eventos donde confirmaste participación
      </Text>

      <FlatList
        data={historial}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.vacio}>
              No has confirmado asistencia todavía.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.badge}>
              <Text style={styles.badgeTexto}>Confirmado</Text>
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
        )}
      />

      <TouchableOpacity
        style={styles.botonVolver}
        onPress={() => router.push("../tabs/dashboard")}
      >
        <Text style={styles.textoBotonVolver}>Volver al inicio</Text>
      </TouchableOpacity>
    </View>
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
  card: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 22,
    marginBottom: 15,
    elevation: 4,
  },
  badge: {
    backgroundColor: "#DCFCE7",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  badgeTexto: {
    color: colors.success,
    fontWeight: "bold",
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
  emptyCard: {
    backgroundColor: colors.card,
    padding: 30,
    borderRadius: 22,
    alignItems: "center",
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  vacio: {
    textAlign: "center",
    color: colors.muted,
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