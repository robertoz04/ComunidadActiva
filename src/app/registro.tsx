import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Picker } from "@react-native-picker/picker";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { useRouter } from "expo-router";
import { auth, db } from "../firebase/config";

export default function Registro() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [rol, setRol] = useState("usuario");

  const registrarUsuario = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    try {
      const credencial = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "usuarios", credencial.user.uid), {
        uid: credencial.user.uid,
        email: credencial.user.email,
        rol,
        creadoEn: serverTimestamp(),
      });

      Alert.alert("Éxito", "Usuario registrado correctamente");

      setEmail("");
      setPassword("");
      setRol("usuario");

      router.push("/login");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Registro</Text>

      <TextInput
        placeholder="Correo"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Contraseña"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.label}>Selecciona el rol</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={rol}
          onValueChange={(itemValue) => setRol(itemValue)}
        >
          <Picker.Item label="Usuario" value="usuario" />
          <Picker.Item label="Organizador" value="organizador" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.boton} onPress={registrarUsuario}>
        <Text style={styles.textoBoton}>Registrarse</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.link}>
          ¿Ya tienes cuenta? Inicia sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },

  titulo: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  label: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: "bold",
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
  },

  boton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },

  textoBoton: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  link: {
    textAlign: "center",
    color: "#2196F3",
    fontWeight: "bold",
  },
});