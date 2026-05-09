import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type UploadCardProps = {
  onTakePhoto?: () => void;
  onFromLibrary?: () => void;
};

const INK = "#2D2926";
const WHITE = "#FFFFFF";
const INK_MUTED = "rgba(45, 41, 38, 0.55)";

export default function UploadCard({
  onTakePhoto,
  onFromLibrary,
}: UploadCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Ionicons name="camera-outline" size={40} color={INK} />
      </View>
      <Text style={styles.title}>Upload your room</Text>
      <View style={styles.actions}>
        <Pressable
          onPress={onTakePhoto}
          style={({ pressed }) => [
            styles.btnPrimary,
            pressed && styles.btnPressed,
          ]}
        >
          <Text style={styles.btnPrimaryText}>Take photo</Text>
        </Pressable>
        <Pressable
          onPress={onFromLibrary}
          style={({ pressed }) => [
            styles.btnOutline,
            pressed && styles.btnOutlinePressed,
          ]}
        >
          <Text style={styles.btnOutlineText}>From library</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: WHITE,
    borderRadius: 28,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: INK_MUTED,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: "center",
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    shadowColor: "#2D2926",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  iconCircle: {
    marginBottom: 16,
  },
  title: {
    fontFamily: "Inter_500Medium",
    fontSize: 17,
    color: INK,
    marginBottom: 22,
    letterSpacing: 0.2,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPressed: {
    opacity: 0.88,
  },
  btnPrimaryText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: WHITE,
    letterSpacing: 0.3,
  },
  btnOutline: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: INK,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnOutlinePressed: {
    backgroundColor: "rgba(45, 41, 38, 0.06)",
  },
  btnOutlineText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: INK,
    letterSpacing: 0.3,
  },
});
