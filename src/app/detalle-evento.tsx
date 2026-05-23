import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, db } from "../firebase/config";

export default function DetalleEvento() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [evento, setEvento] = useState<any>(null);
  const [comentario, setComentario] = useState("");
  const [calificacion, setCalificacion] = useState("");

  const cargarEvento = async () => {
    if (!id) return;

    const docRef = doc(db, "eventos", String(id));
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setEvento({ id: docSnap.id, ...docSnap.data() });
    }
  };

  useEffect(() => {
    cargarEvento();
  }, [id]);

  if (!id) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>No se encontró el evento</Text>
        <TouchableOpacity style={styles.boton} onPress={() => router.push("/dashboard")}>
          <Text style={styles.textoBoton}>Volver al Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!evento) {
    return (
      <View style={styles.container}>
        <Text>Cargando evento...</Text>
      </View>
    );
  }

  const confirmarAsistencia = async () => {
    if (!auth.currentUser) {
      Alert.alert("Aviso", "Debes iniciar sesión para confirmar asistencia");
      return;
    }

    await addDoc(collection(db, "asistencias"), {
      eventoId: id,
      usuarioId: auth.currentUser.uid,
      usuarioEmail: auth.currentUser.email,
      confirmado: true,
      fechaConfirmacion: serverTimestamp(),
    });

    Alert.alert("Éxito", "Asistencia confirmada");
  };

  const guardarComentario = async () => {
    if (!auth.currentUser) {
      Alert.alert("Aviso", "Debes iniciar sesión para comentar");
      return;
    }

    if (!comentario || !calificacion) {
      Alert.alert("Error", "Escribe un comentario y una calificación");
      return;
    }

    const nota = Number(calificacion);

    if (nota < 1 || nota > 5) {
      Alert.alert("Error", "La calificación debe ser del 1 al 5");
      return;
    }

    await addDoc(collection(db, "comentarios"), {
      eventoId: id,
      usuarioId: auth.currentUser.uid,
      usuarioEmail: auth.currentUser.email,
      comentario,
      calificacion: nota,
      creadoEn: serverTimestamp(),
    });

    Alert.alert("Éxito", "Comentario guardado");
    setComentario("");
    setCalificacion("");
  };

  const compartirEvento = async () => {
    await Share.share({
      message: `Te invito al evento: ${evento.titulo}
Fecha: ${evento.fecha}
Hora: ${evento.hora}
Lugar: ${evento.ubicacion}`,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>{evento.titulo}</Text>

      <View style={styles.card}>
        <Text style={styles.texto}>{evento.descripcion}</Text>
        <Text style={styles.texto}>📅 {evento.fecha}</Text>
        <Text style={styles.texto}>🕒 {evento.hora}</Text>
        <Text style={styles.texto}>📍 {evento.ubicacion}</Text>
        <Text style={styles.estado}>Estado: {evento.estado}</Text>
      </View>

      <TouchableOpacity style={styles.boton} onPress={confirmarAsistencia}>
        <Text style={styles.textoBoton}>Confirmar asistencia</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botonCompartir} onPress={compartirEvento}>
        <Text style={styles.textoBoton}>Compartir evento</Text>
      </TouchableOpacity>

      <Text style={styles.subtitulo}>Comentario y calificación</Text>

      <TextInput
        placeholder="Escribe tu comentario"
        style={styles.input}
        value={comentario}
        onChangeText={setComentario}
      />

      <TextInput
        placeholder="Calificación del 1 al 5"
        style={styles.input}
        keyboardType="numeric"
        value={calificacion}
        onChangeText={setCalificacion}
      />

      <TouchableOpacity style={styles.botonComentario} onPress={guardarComentario}>
        <Text style={styles.textoBoton}>Guardar comentario</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F4F6F8" },
  titulo: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginVertical: 20 },
  card: { backgroundColor: "#fff", padding: 18, borderRadius: 15, marginBottom: 20 },
  texto: { fontSize: 16, marginBottom: 8 },
  estado: { fontWeight: "bold", color: "#4CAF50", marginTop: 10 },
  boton: { backgroundColor: "#2196F3", padding: 15, borderRadius: 12, alignItems: "center", marginBottom: 10 },
  botonCompartir: { backgroundColor: "#673AB7", padding: 15, borderRadius: 12, alignItems: "center", marginBottom: 20 },
  botonComentario: { backgroundColor: "#4CAF50", padding: 15, borderRadius: 12, alignItems: "center", marginBottom: 30 },
  textoBoton: { color: "#fff", fontWeight: "bold" },
  subtitulo: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", padding: 15, borderRadius: 10, marginBottom: 12 },
});