import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { db } from "../firebase/config";

export default function Estadisticas() {
  const [totalEventos, setTotalEventos] = useState(0);
  const [totalAsistencias, setTotalAsistencias] = useState(0);
  const [totalComentarios, setTotalComentarios] = useState(0);
  const [promedioCalificacion, setPromedioCalificacion] = useState(0);

  const cargarEstadisticas = async () => {
    const eventosSnap = await getDocs(collection(db, "eventos"));
    const asistenciasSnap = await getDocs(collection(db, "asistencias"));
    const comentariosSnap = await getDocs(collection(db, "comentarios"));

    setTotalEventos(eventosSnap.size);
    setTotalAsistencias(asistenciasSnap.size);
    setTotalComentarios(comentariosSnap.size);

    let suma = 0;

    comentariosSnap.forEach((doc) => {
      const data = doc.data();
      suma += Number(data.calificacion || 0);
    });

    const promedio =
      comentariosSnap.size > 0 ? suma / comentariosSnap.size : 0;

    setPromedioCalificacion(promedio);
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Estadísticas</Text>

      <View style={styles.card}>
        <Text style={styles.numero}>{totalEventos}</Text>
        <Text style={styles.texto}>Total de eventos</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.numero}>{totalAsistencias}</Text>
        <Text style={styles.texto}>Asistencias confirmadas</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.numero}>{totalComentarios}</Text>
        <Text style={styles.texto}>Comentarios registrados</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.numero}>{promedioCalificacion.toFixed(1)}</Text>
        <Text style={styles.texto}>Promedio de calificación</Text>
      </View>
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
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 30,
  },
  card: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: "center",
  },
  numero: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2196F3",
  },
  texto: {
    fontSize: 16,
    marginTop: 8,
  },
});