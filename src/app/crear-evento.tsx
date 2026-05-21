import { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";

export default function CrearEvento() {
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [ubicacion, setUbicacion] = useState("");

  const guardarEvento = async () => {
    if (!titulo || !descripcion || !fecha || !hora || !ubicacion) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    try {
      await addDoc(collection(db, "eventos"), {
        titulo,
        descripcion,
        fecha,
        hora,
        ubicacion,
        organizadorId: auth.currentUser?.uid || "",
        organizadorEmail: auth.currentUser?.email || "",
        estado: "proximo",
        creadoEn: serverTimestamp(),
      });

      Alert.alert("Éxito", "Evento creado correctamente");

      setTitulo("");
      setDescripcion("");
      setFecha("");
      setHora("");
      setUbicacion("");

      router.push("/dashboard");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Crear Evento</Text>

      <TextInput
        placeholder="Título del evento"
        style={styles.input}
        value={titulo}
        onChangeText={setTitulo}
      />

      <TextInput
        placeholder="Descripción"
        style={styles.input}
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <TextInput
        placeholder="Fecha: 2026-06-10"
        style={styles.input}
        value={fecha}
        onChangeText={setFecha}
      />

      <TextInput
        placeholder="Hora: 08:00 AM"
        style={styles.input}
        value={hora}
        onChangeText={setHora}
      />

      <TextInput
        placeholder="Ubicación"
        style={styles.input}
        value={ubicacion}
        onChangeText={setUbicacion}
      />

      <TouchableOpacity style={styles.boton} onPress={guardarEvento}>
        <Text style={styles.textoBoton}>Guardar Evento</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  boton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  textoBoton: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});