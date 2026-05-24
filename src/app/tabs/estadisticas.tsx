import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { auth, db } from "../../firebase/config";

export default function Estadisticas() {
  const [rol, setRol] = useState("");

  const [totalEventos, setTotalEventos] = useState(0);
  const [totalAsistencias, setTotalAsistencias] = useState(0);
  const [totalComentarios, setTotalComentarios] = useState(0);
  const [promedio, setPromedio] = useState(0);

  const [misAsistencias, setMisAsistencias] = useState(0);
  const [misComentarios, setMisComentarios] = useState(0);
  const [miPromedio, setMiPromedio] = useState(0);

  const cargarEstadisticas = async () => {
    const eventosSnapshot = await getDocs(collection(db, "eventos"));
    const asistenciasSnapshot = await getDocs(collection(db, "asistencias"));
    const comentariosSnapshot = await getDocs(collection(db, "comentarios"));

    setTotalEventos(eventosSnapshot.size);
    setTotalAsistencias(asistenciasSnapshot.size);
    setTotalComentarios(comentariosSnapshot.size);

    let sumaCalificaciones = 0;

    comentariosSnapshot.forEach((documento) => {
      sumaCalificaciones += Number(documento.data().calificacion || 0);
    });

    const promedioGeneral =
      comentariosSnapshot.size > 0
        ? sumaCalificaciones / comentariosSnapshot.size
        : 0;

    setPromedio(promedioGeneral);

    const usuario = auth.currentUser;

    if (usuario) {
      const misAsistenciasFiltradas = asistenciasSnapshot.docs.filter(
        (documento) => documento.data().usuarioId === usuario.uid
      );

      const misComentariosFiltrados = comentariosSnapshot.docs.filter(
        (documento) => documento.data().usuarioId === usuario.uid
      );

      setMisAsistencias(misAsistenciasFiltradas.length);
      setMisComentarios(misComentariosFiltrados.length);

      let sumaPersonal = 0;

      misComentariosFiltrados.forEach((documento) => {
        sumaPersonal += Number(documento.data().calificacion || 0);
      });

      const promedioPersonal =
        misComentariosFiltrados.length > 0
          ? sumaPersonal / misComentariosFiltrados.length
          : 0;

      setMiPromedio(promedioPersonal);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      const rolGuardado = await AsyncStorage.getItem("rol");
      setRol(rolGuardado || "");
      await cargarEstadisticas();
    };

    cargarDatos();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>
        {rol === "organizador"
          ? "📊 Estadísticas Generales"
          : "🙋 Mi Participación"}
      </Text>

      {rol === "organizador" ? (
        <>
          <View style={styles.card}>
            <Text style={styles.numero}>{totalEventos}</Text>
            <Text style={styles.label}>Total de eventos</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.numero}>{totalAsistencias}</Text>
            <Text style={styles.label}>Asistencias confirmadas</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.numero}>{totalComentarios}</Text>
            <Text style={styles.label}>Comentarios registrados</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.numero}>{promedio.toFixed(1)}</Text>
            <Text style={styles.label}>Promedio de calificación</Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.numero}>{misAsistencias}</Text>
            <Text style={styles.label}>Eventos asistidos</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.numero}>{misComentarios}</Text>
            <Text style={styles.label}>Comentarios realizados</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.numero}>{miPromedio.toFixed(1)}</Text>
            <Text style={styles.label}>Mi promedio de calificación</Text>
          </View>
        </>
      )}
    </ScrollView>
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
    color: "#1E293B",
  },
  card: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 18,
    marginBottom: 15,
    alignItems: "center",
    elevation: 3,
  },
  numero: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2563EB",
  },
  label: {
    fontSize: 16,
    marginTop: 8,
    color: "#64748B",
    textAlign: "center",
  },
});