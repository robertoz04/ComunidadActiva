import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { auth, db } from "../firebase/config";

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
      <Text style={styles.titulo}>Historial de Participación</Text>

      <FlatList
        data={historial}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.vacio}>
            No has confirmado asistencia todavía.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>{item.titulo}</Text>
            <Text style={styles.texto}>📅 {item.fecha}</Text>
            <Text style={styles.texto}>🕒 {item.hora}</Text>
            <Text style={styles.texto}>📍 {item.ubicacion}</Text>
            <Text style={styles.texto}>Usuario: {item.usuarioEmail}</Text>
            <Text style={styles.estado}>
              {item.confirmado
                ? "Asistencia confirmada"
                : "Asistencia pendiente"}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F4F6F8",
  },
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 30,
    color: "#1E293B",
  },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
  },
  cardTitulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#0F172A",
  },
  texto: {
    fontSize: 16,
    marginBottom: 8,
    color: "#475569",
  },
  estado: {
    fontWeight: "bold",
    color: "#16A34A",
  },
  vacio: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 30,
  },
});