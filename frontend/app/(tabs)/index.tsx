import { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_600SemiBold,
} from "@expo-google-fonts/playfair-display";
import { Inter_400Regular, Inter_500Medium } from "@expo-google-fonts/inter";
import { Ionicons } from "@expo/vector-icons";
import UploadCard from "../../components/UploadCard";

const BG = "#F5F0EB";
const INK = "#2D2926";
const INK_MUTED = "rgba(45, 41, 38, 0.55)";

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const contentMax = Math.min(width, 430);

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
  });

  const onTakePhoto = useCallback(() => {
    // Wire to camera / image picker
  }, []);

  const onFromLibrary = useCallback(() => {
    // Wire to library picker
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: Math.max(20, (width - contentMax) / 2) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.logoMark}>n</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profile"
            hitSlop={12}
            style={({ pressed }) => [pressed && styles.headerIconPressed]}
          >
            <Ionicons name="person-outline" size={26} color={INK} />
          </Pressable>
        </View>

        <Text style={styles.issueTag}>ISSUE 04 · SPRING</Text>

        <Text style={styles.heroTitle}>NOOK</Text>
        <Text style={styles.heroSubtitle}>Small changes. Better spaces.</Text>

        <View style={styles.uploadSection}>
          <UploadCard
            onTakePhoto={onTakePhoto}
            onFromLibrary={onFromLibrary}
          />
        </View>

        <View style={styles.recent}>
          <Text style={styles.recentLine}>
            <Text style={styles.recentLabel}>RECENT</Text>
            <Text style={styles.recentDash}> — </Text>
            <Text style={styles.recentSerif}>Your saved nooks</Text>
          </Text>
          <Text style={styles.recentHint}>No saved nooks yet.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    maxWidth: 430,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  headerIconPressed: {
    opacity: 0.55,
  },
  logoMark: {
    fontFamily: "PlayfairDisplay_600SemiBold",
    fontSize: 32,
    color: INK,
    lineHeight: 36,
  },
  issueTag: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 3.2,
    color: INK_MUTED,
    marginBottom: 16,
    textTransform: "uppercase",
  },
  heroTitle: {
    fontFamily: "PlayfairDisplay_600SemiBold",
    fontSize: 52,
    lineHeight: 56,
    color: INK,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontFamily: "PlayfairDisplay_400Regular",
    fontSize: 18,
    lineHeight: 26,
    color: INK,
    opacity: 0.92,
    marginBottom: 32,
  },
  uploadSection: {
    marginBottom: 40,
  },
  recent: {
    gap: 10,
  },
  recentLine: {
    fontSize: 14,
    lineHeight: 22,
  },
  recentLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    letterSpacing: 2.4,
    color: INK_MUTED,
    textTransform: "uppercase",
  },
  recentDash: {
    fontFamily: "Inter_400Regular",
    color: INK_MUTED,
  },
  recentSerif: {
    fontFamily: "PlayfairDisplay_400Regular",
    fontSize: 16,
    color: INK,
  },
  recentHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: INK_MUTED,
    letterSpacing: 0.2,
  },
});
