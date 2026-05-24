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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db } from "../firebase/config";
import { colors } from "../styles/theme";

export default function Registro() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        rol: "usuario",
        creadoEn: serverTimestamp(),
      });

      Alert.alert("Éxito", "Usuario registrado correctamente");
      router.replace("/login");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>🤝</Text>
        <Text style={styles.titulo}>Crear cuenta</Text>
        <Text style={styles.subtitulo}>
          Regístrate para participar en eventos comunitarios
        </Text>

        <TextInput
          placeholder="Correo electrónico"
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

        <View style={styles.infoRol}>
          <Text style={styles.infoRolTexto}>
            Al registrarte ingresarás como usuario participante.
          </Text>
        </View>

        <TouchableOpacity style={styles.boton} onPress={registrarUsuario}>
          <Text style={styles.textoBoton}>Registrarse</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/login")}>
          <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: colors.card,
    padding: 25,
    borderRadius: 22,
    elevation: 4,
  },
  logo: {
    fontSize: 45,
    textAlign: "center",
    marginBottom: 10,
  },
  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: colors.text,
  },
  subtitulo: {
    textAlign: "center",
    color: colors.muted,
    marginBottom: 25,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    borderRadius: 12,
    marginBottom: 14,
  },
  infoRol: {
    backgroundColor: "#DBEAFE",
    padding: 12,
    borderRadius: 14,
    marginBottom: 18,
  },
  infoRolTexto: {
    color: colors.primary,
    textAlign: "center",
    fontWeight: "600",
  },
  boton: {
    backgroundColor: colors.success,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 18,
  },
  textoBoton: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    textAlign: "center",
    color: colors.primary,
    fontWeight: "bold",
  },
});