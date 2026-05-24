import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { auth, db } from "../firebase/config";
import { colors } from "../styles/theme";

type Comentario = {
  id: string;
  usuarioEmail: string;
  comentario: string;
  calificacion: number;
};

export default function DetalleEvento() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [evento, setEvento] = useState<any>(null);
  const [comentario, setComentario] = useState("");
  const [calificacion, setCalificacion] = useState("");
  const [comentarios, setComentarios] = useState<Comentario[]>([]);

  const cargarEvento = async () => {
    if (!id) return;

    const docRef = doc(db, "eventos", String(id));
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setEvento({ id: docSnap.id, ...docSnap.data() });
    }
  };

  const cargarComentarios = async () => {
    if (!id) return;

    const q = query(
      collection(db, "comentarios"),
      where("eventoId", "==", String(id))
    );

    const resultado = await getDocs(q);

    const lista = resultado.docs.map((documento) => ({
      id: documento.id,
      ...documento.data(),
    })) as Comentario[];

    setComentarios(lista);
  };

  useEffect(() => {
    cargarEvento();
    cargarComentarios();
  }, [id]);

  const confirmarAsistencia = async () => {
    if (!auth.currentUser) {
      Alert.alert("Aviso", "Debes iniciar sesión para confirmar asistencia");
      return;
    }

    await addDoc(collection(db, "asistencias"), {
      eventoId: String(id),
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
      eventoId: String(id),
      usuarioId: auth.currentUser.uid,
      usuarioEmail: auth.currentUser.email,
      comentario,
      calificacion: nota,
      creadoEn: serverTimestamp(),
    });

    Alert.alert("Éxito", "Comentario guardado");

    setComentario("");
    setCalificacion("");
    cargarComentarios();
  };

  const compartirEvento = async () => {
    if (!evento) {
      Alert.alert("Error", "El evento todavía no ha cargado");
      return;
    }

    await Share.share({
      message: `Te invito al evento: ${evento.titulo}
Fecha: ${evento.fecha}
Hora: ${evento.hora}
Lugar: ${evento.ubicacion}`,
    });
  };

  if (!id) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>No se encontró el evento</Text>

        <TouchableOpacity
          style={styles.boton}
          onPress={() => router.push("../(tabs)/dashboard")}
        >
          <Text style={styles.textoBoton}>Volver al Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!evento) {
    return (
      <View style={styles.container}>
        <Text style={styles.cargando}>Cargando evento...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>{evento.titulo}</Text>
      <Text style={styles.subtitulo}>Detalle de actividad comunitaria</Text>

      <View style={styles.card}>
        <Text style={styles.descripcion}>{evento.descripcion}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.info}>📅 Fecha: {evento.fecha}</Text>
          <Text style={styles.info}>🕒 Hora: {evento.hora}</Text>
          <Text style={styles.info}>📍 Lugar: {evento.ubicacion}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.boton} onPress={confirmarAsistencia}>
        <Text style={styles.textoBoton}>✅ Confirmar asistencia</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botonCompartir} onPress={compartirEvento}>
        <Text style={styles.textoBoton}>📤 Compartir evento</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.seccionTitulo}>Comentario y calificación</Text>

        <TextInput
          placeholder="Escribe tu comentario"
          style={[styles.input, styles.textArea]}
          value={comentario}
          onChangeText={setComentario}
          multiline
        />

        <TextInput
          placeholder="Calificación del 1 al 5"
          style={styles.input}
          keyboardType="numeric"
          value={calificacion}
          onChangeText={setCalificacion}
        />

        <TouchableOpacity
          style={styles.botonComentario}
          onPress={guardarComentario}
        >
          <Text style={styles.textoBoton}>💬 Guardar comentario</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.seccionTitulo}>Comentarios del evento</Text>

      <FlatList
        data={comentarios}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={styles.vacio}>Aún no hay comentarios.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.comentarioCard}>
            <Text style={styles.email}>{item.usuarioEmail}</Text>
            <Text style={styles.comentarioTexto}>{item.comentario}</Text>
            <Text style={styles.calificacion}>
              ⭐ Calificación: {item.calificacion}/5
            </Text>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.botonVolver}
        onPress={() => router.push("/tabs/dashboard")}
      >
        <Text style={styles.textoVolver}>Volver al inicio</Text>
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
    marginBottom: 20,
  },
  cargando: {
    textAlign: "center",
    marginTop: 80,
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 22,
    marginBottom: 18,
    elevation: 4,
  },
  descripcion: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 15,
  },
  infoBox: {
    backgroundColor: "#F8FAFC",
    padding: 15,
    borderRadius: 15,
  },
  info: {
    fontSize: 15,
    color: colors.muted,
    marginBottom: 6,
  },
  boton: {
  backgroundColor: "#DBEAFE",
  paddingVertical: 13,
  borderRadius: 18,
  alignItems: "center",
  marginBottom: 10,
},

botonCompartir: {
  backgroundColor: "#EDE9FE",
  paddingVertical: 13,
  borderRadius: 18,
  alignItems: "center",
  marginBottom: 18,
},

botonComentario: {
  backgroundColor: "#DCFCE7",
  paddingVertical: 13,
  borderRadius: 18,
  alignItems: "center",
},

textoBoton: {
  color: colors.text,
  fontWeight: "bold",
  fontSize: 16,
},
  seccionTitulo: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    borderRadius: 12,
    marginBottom: 14,
  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
  },
  comentarioCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
    elevation: 2,
  },
  email: {
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 5,
  },
  comentarioTexto: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 5,
  },
  calificacion: {
    fontWeight: "bold",
    color: colors.warning,
  },
  vacio: {
    textAlign: "center",
    color: colors.muted,
    marginBottom: 20,
  },
  botonVolver: {
    padding: 15,
    alignItems: "center",
    marginBottom: 25,
  },
  textoVolver: {
    color: colors.primary,
    fontWeight: "bold",
  },
});