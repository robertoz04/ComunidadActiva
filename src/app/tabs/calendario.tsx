import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { db } from "../../firebase/config";

type Evento = {
  id: string;
  titulo: string;
  fecha: string;
};

export default function Calendario() {
  const [eventos, setEventos] = useState<Evento[]>([]);

  const cargarEventos = async () => {
    const resultado = await getDocs(collection(db, "eventos"));

    const lista = resultado.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Evento[];

    setEventos(lista);
  };

  useEffect(() => {
    cargarEventos();
  }, []);

  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = hoy.getMonth();

  const diasMes = new Date(year, month + 1, 0).getDate();

  const tieneEvento = (dia: number) => {
    const fecha = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      dia
    ).padStart(2, "0")}`;

    return eventos.some((evento) => evento.fecha === fecha);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>📅 Calendario</Text>
      <Text style={styles.subtitulo}>
        Eventos del mes actual
      </Text>

      <View style={styles.grid}>
        {Array.from({ length: diasMes }, (_, index) => {
          const dia = index + 1;
          const evento = tieneEvento(dia);

          return (
            <View
              key={dia}
              style={[
                styles.dia,
                evento && styles.diaConEvento,
              ]}
            >
              <Text
                style={[
                  styles.numeroDia,
                  evento && styles.numeroDiaEvento,
                ]}
              >
                {dia}
              </Text>

              {evento && <Text style={styles.punto}>●</Text>}
            </View>
          );
        })}
      </View>

      <Text style={styles.leyenda}>● Día con evento</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    padding: 20,
  },
  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 35,
    color: "#1E293B",
  },
  subtitulo: {
    textAlign: "center",
    color: "#64748B",
    marginBottom: 25,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 22,
    elevation: 4,
  },
  dia: {
    width: "13%",
    height: 58,
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  diaConEvento: {
    backgroundColor: "#DBEAFE",
  },
  numeroDia: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#334155",
  },
  numeroDiaEvento: {
    color: "#2563EB",
  },
  punto: {
    color: "#2563EB",
    fontSize: 12,
  },
  leyenda: {
    marginTop: 18,
    textAlign: "center",
    color: "#2563EB",
    fontWeight: "bold",
  },
});