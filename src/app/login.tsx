import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";

import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase/config";
import { colors } from "../styles/theme";

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [request, response, promptAsync] = Google.useAuthRequest({
  webClientId:
    "300361180136-kjarp2r4cg1mnk43mv6893nqebfge010.apps.googleusercontent.com",

  androidClientId:
    "300361180136-kjarp2r4cg1mnk43mv6893nqebfge010.apps.googleusercontent.com",
});
  useEffect(() => {
    const iniciarConGoogle = async () => {
      if (response?.type === "success") {
        try {
          const { id_token } = response.params;

          const credential = GoogleAuthProvider.credential(id_token);

          const resultado = await signInWithCredential(auth, credential);

          const usuarioRef = doc(db, "usuarios", resultado.user.uid);
          const usuarioSnap = await getDoc(usuarioRef);

          let rolUsuario = "usuario";

          if (!usuarioSnap.exists()) {
            await setDoc(usuarioRef, {
              uid: resultado.user.uid,
              email: resultado.user.email,
              rol: "usuario",
              creadoEn: serverTimestamp(),
            });
          } else {
            const data = usuarioSnap.data();
            rolUsuario = data.rol || "usuario";
          }

          await AsyncStorage.setItem("rol", rolUsuario);
          await AsyncStorage.setItem("email", resultado.user.email || "");

          router.replace("/tabs/dashboard");
        } catch (error: any) {
          Alert.alert("Error", error.message);
        }
      }
    };

    iniciarConGoogle();
  }, [response]);

  const iniciarSesion = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    try {
      const credencial = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const usuarioRef = doc(db, "usuarios", credencial.user.uid);
      const usuarioSnap = await getDoc(usuarioRef);

      if (usuarioSnap.exists()) {
        const data = usuarioSnap.data();

        await AsyncStorage.setItem("rol", data.rol || "usuario");
        await AsyncStorage.setItem("email", credencial.user.email || "");
      }

      router.replace("/tabs/dashboard");
    } catch (error: any) {
      Alert.alert("Error", "Correo o contraseña incorrectos");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>🌎</Text>
        <Text style={styles.titulo}>Comunidad Activa</Text>
        <Text style={styles.subtitulo}>Inicia sesión para continuar</Text>

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

        <TouchableOpacity style={styles.boton} onPress={iniciarSesion}>
          <Text style={styles.textoBoton}>Ingresar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botonGoogle}
          disabled={!request}
          onPress={() => promptAsync()}
        >
          <Text style={styles.textoGoogle}>🌐 Continuar con Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/registro")}>
          <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
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
  boton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
    marginBottom: 18,
  },
  textoBoton: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  botonGoogle: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 18,
  },
  textoGoogle: {
    color: colors.text,
    fontWeight: "bold",
    fontSize: 16,
  },
  link: {
    textAlign: "center",
    color: colors.primary,
    fontWeight: "bold",
  },
});