import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { useRouter } from "expo-router";
import { db } from "../firebase/config";

type Evento = {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  ubicacion: string;
  estado: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [eventos, setEventos] = useState<Evento[]>([]);

  const cargarEventos = async () => {
    const q = query(collection(db, "eventos"), orderBy("creadoEn", "desc"));
    const resultado = await getDocs(q);

    const lista = resultado.docs.map((documento) => ({
      id: documento.id,
      ...documento.data(),
    })) as Evento[];

    setEventos(lista);
  };

  const eliminarEvento = async (id: string) => {
    const confirmar = confirm("¿Seguro que deseas eliminar este evento?");

    if (!confirmar) return;

    await deleteDoc(doc(db, "eventos", id));

    Alert.alert("Éxito", "Evento eliminado correctamente");
    cargarEventos();
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Comunidad Activa</Text>
      <Text style={styles.subtitulo}>Eventos comunitarios disponibles</Text>

      <TouchableOpacity
        style={styles.botonCrear}
        onPress={() => router.push("/crear-evento")}
      >
        <Text style={styles.textoBoton}>+ Crear evento</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botonHistorial}
        onPress={() => router.push("/historial")}
      >
        <Text style={styles.textoBoton}>Ver historial</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botonEstadisticas}
        onPress={() => router.push("/estadisticas")}
      >
        <Text style={styles.textoBoton}>Ver estadísticas</Text>
      </TouchableOpacity>

      <FlatList
        data={eventos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.vacio}>No hay eventos registrados.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>{item.titulo}</Text>
            <Text style={styles.cardTexto}>{item.descripcion}</Text>
            <Text style={styles.cardTexto}>📅 {item.fecha}</Text>
            <Text style={styles.cardTexto}>🕒 {item.hora}</Text>
            <Text style={styles.cardTexto}>📍 {item.ubicacion}</Text>
            <Text style={styles.estado}>Estado: {item.estado}</Text>

            <TouchableOpacity
              style={styles.botonDetalle}
              onPress={() =>
                router.push({
                  pathname: "/detalle-evento",
                  params: { id: item.id },
                })
              }
            >
              <Text style={styles.textoBoton}>Ver detalle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botonEditar}
              onPress={() =>
                router.push({
                  pathname: "/editar-evento",
                  params: { id: item.id },
                })
              }
            >
              <Text style={styles.textoBoton}>Editar evento</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botonEliminar}
              onPress={() => eliminarEvento(item.id)}
            >
              <Text style={styles.textoBoton}>Eliminar evento</Text>
            </TouchableOpacity>
          </View>
        )}
      />
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
    marginTop: 40,
  },
  subtitulo: {
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  botonCrear: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  botonHistorial: {
    backgroundColor: "#673AB7",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  botonEstadisticas: {
    backgroundColor: "#FF9800",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  botonDetalle: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  botonEditar: {
    backgroundColor: "#009688",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  botonEliminar: {
    backgroundColor: "#F44336",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  textoBoton: {
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
  },
  cardTitulo: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  cardTexto: {
    fontSize: 15,
    marginBottom: 5,
    color: "#333",
  },
  estado: {
    marginTop: 8,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  vacio: {
    textAlign: "center",
    marginTop: 30,
    color: "#777",
  },
});