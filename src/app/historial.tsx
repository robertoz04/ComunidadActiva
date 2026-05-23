import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { auth, db } from "../firebase/config";

type Asistencia = {
  id: string;
  eventoId: string;
  usuarioEmail: string;
  confirmado: boolean;
};

export default function Historial() {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);

  const cargarHistorial = async () => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "asistencias"),
      where("usuarioId", "==", auth.currentUser.uid)
    );

    const resultado = await getDocs(q);

    const lista = resultado.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Asistencia[];

    setAsistencias(lista);
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Historial de Participación</Text>

      <FlatList
        data={asistencias}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.vacio}>No has confirmado asistencia todavía.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.texto}>Evento ID: {item.eventoId}</Text>
            <Text style={styles.texto}>Usuario: {item.usuarioEmail}</Text>
            <Text style={styles.estado}>
              Estado: {item.confirmado ? "Asistencia confirmada" : "Pendiente"}
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
  },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
  },
  texto: {
    fontSize: 16,
    marginBottom: 8,
  },
  estado: {
    fontWeight: "bold",
    color: "#4CAF50",
  },
  vacio: {
    textAlign: "center",
    color: "#777",
    marginTop: 30,
  },
});