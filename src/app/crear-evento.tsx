import { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { auth, db } from "../firebase/config";
import { colors } from "../styles/theme";

export default function CrearEvento() {
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [ubicacion, setUbicacion] = useState("");

  const [mostrarFecha, setMostrarFecha] = useState(false);
  const [mostrarHora, setMostrarHora] = useState(false);

  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [horaSeleccionada, setHoraSeleccionada] = useState(new Date());

  const formatearFecha = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatearHora = (date: Date) => {
    let horas = date.getHours();
    const minutos = String(date.getMinutes()).padStart(2, "0");
    const periodo = horas >= 12 ? "PM" : "AM";

    horas = horas % 12;
    horas = horas === 0 ? 12 : horas;

    return `${horas}:${minutos} ${periodo}`;
  };

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
        creadoEn: serverTimestamp(),
      });

      Alert.alert("Éxito", "Evento creado correctamente");

      setTitulo("");
      setDescripcion("");
      setFecha("");
      setHora("");
      setUbicacion("");

      router.replace("../tabs/dashboard");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Crear evento</Text>
      <Text style={styles.subtitulo}>
        Registra una nueva actividad comunitaria
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          placeholder="Ejemplo: Jornada de limpieza"
          style={styles.input}
          value={titulo}
          onChangeText={setTitulo}
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          placeholder="Describe brevemente el evento"
          style={[styles.input, styles.textArea]}
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
        />

        <Text style={styles.label}>Fecha</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setMostrarFecha(true)}
        >
          <Text style={fecha ? styles.selectorTexto : styles.placeholder}>
            {fecha || "Seleccionar fecha"}
          </Text>
        </TouchableOpacity>

        {mostrarFecha && (
          <DateTimePicker
            value={fechaSeleccionada}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setMostrarFecha(Platform.OS === "ios");

              if (selectedDate) {
                setFechaSeleccionada(selectedDate);
                setFecha(formatearFecha(selectedDate));
              }
            }}
          />
        )}

        <Text style={styles.label}>Hora</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setMostrarHora(true)}
        >
          <Text style={hora ? styles.selectorTexto : styles.placeholder}>
            {hora || "Seleccionar hora"}
          </Text>
        </TouchableOpacity>

        {mostrarHora && (
          <DateTimePicker
            value={horaSeleccionada}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setMostrarHora(Platform.OS === "ios");

              if (selectedTime) {
                setHoraSeleccionada(selectedTime);
                setHora(formatearHora(selectedTime));
              }
            }}
          />
        )}

        <Text style={styles.label}>Ubicación</Text>
        <TextInput
          placeholder="Ejemplo: Parque central"
          style={styles.input}
          value={ubicacion}
          onChangeText={setUbicacion}
        />

        <TouchableOpacity style={styles.boton} onPress={guardarEvento}>
          <Text style={styles.textoBoton}>Guardar evento</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonSecundario}
          onPress={() => router.push("../tabs/dashboard")}
        >
          <Text style={styles.textoSecundario}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginTop: 35,
  },
  subtitulo: {
    textAlign: "center",
    color: colors.muted,
    marginBottom: 25,
  },
  card: {
    backgroundColor: colors.card,
    padding: 22,
    borderRadius: 22,
    elevation: 4,
    marginBottom: 30,
  },
  label: {
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    borderRadius: 12,
    marginBottom: 14,
  },
  selector: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    borderRadius: 12,
    marginBottom: 14,
  },
  selectorTexto: {
    color: colors.text,
  },
  placeholder: {
    color: "#94A3B8",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  boton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
  },
  textoBoton: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  botonSecundario: {
    padding: 15,
    alignItems: "center",
    marginTop: 8,
  },
  textoSecundario: {
    color: colors.muted,
    fontWeight: "bold",
  },
});