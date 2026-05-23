import { useEffect, useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export default function EditarEvento() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [estado, setEstado] = useState("");

  const cargarEvento = async () => {
    if (!id) return;

    const docRef = doc(db, "eventos", String(id));
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      setTitulo(data.titulo || "");
      setDescripcion(data.descripcion || "");
      setFecha(data.fecha || "");
      setHora(data.hora || "");
      setUbicacion(data.ubicacion || "");
      setEstado(data.estado || "proximo");
    }
  };

  const actualizarEvento = async () => {
    if (!titulo || !descripcion || !fecha || !hora || !ubicacion || !estado) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    await updateDoc(doc(db, "eventos", String(id)), {
      titulo,
      descripcion,
      fecha,
      hora,
      ubicacion,
      estado,
    });

    Alert.alert("Éxito", "Evento actualizado correctamente");
    router.push("/dashboard");
  };

  useEffect(() => {
    cargarEvento();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Editar Evento</Text>

      <TextInput
        placeholder="Título"
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
        placeholder="Fecha: 2026-05-21"
        style={styles.input}
        value={fecha}
        onChangeText={setFecha}
      />

      <TextInput
        placeholder="Hora: 07:00 am"
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

      <TextInput
        placeholder="Estado: proximo o pasado"
        style={styles.input}
        value={estado}
        onChangeText={setEstado}
      />

      <TouchableOpacity style={styles.boton} onPress={actualizarEvento}>
        <Text style={styles.textoBoton}>Actualizar evento</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F4F6F8",
    justifyContent: "center",
  },
  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  boton: {
    backgroundColor: "#009688",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  textoBoton: {
    color: "#fff",
    fontWeight: "bold",
  },
});