export const colors = {
  primary: "#2563EB",
  secondary: "#7C3AED",
  success: "#16A34A",
  danger: "#DC2626",
  warning: "#F59E0B",
  background: "#F4F6F8",
  card: "#FFFFFF",
  text: "#1E293B",
  muted: "#64748B",
  border: "#CBD5E1",
};

export const globalStyles = {
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold" as const,
    color: colors.text,
    textAlign: "center" as const,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.muted,
    textAlign: "center" as const,
    marginBottom: 25,
  },
  card: {
    backgroundColor: colors.card,
    padding: 18,
    borderRadius: 18,
    marginBottom: 15,
    elevation: 3,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    borderRadius: 12,
    marginBottom: 14,
  },
};