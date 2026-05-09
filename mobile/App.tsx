import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import {
  analyzeRoom,
  type AnalyzeRoomResponse,
} from "./lib/api";

const BG = "#F5F0EB";
const INK = "#2D2926";
const WHITE = "#FFFFFF";
const INK_SOFT = "rgba(45, 41, 38, 0.55)";
const TICK_GREEN = "#2E7D32";

const serif = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

/** System UI sans; iOS’ta fontFamily verilmez (SF Pro). */
const sans = Platform.select<string | undefined>({
  ios: undefined,
  android: "sans-serif",
  default: undefined,
});

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [4, 3],
  quality: 0.85,
  base64: true,
};

function CameraGlyph({ color, size }: { color: string; size: number }) {
  const bodyW = size * 0.72;
  const bodyH = size * 0.52;
  const lens = size * 0.2;
  return (
    <View
      style={{
        width: size,
        height: size * 0.88,
        alignItems: "center",
        justifyContent: "flex-end",
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          width: size * 0.38,
          height: size * 0.2,
          borderWidth: 2,
          borderColor: color,
          borderRadius: 5,
          borderBottomLeftRadius: 2,
          borderBottomRightRadius: 2,
        }}
      />
      <View
        style={{
          width: bodyW,
          height: bodyH,
          borderWidth: 2,
          borderColor: color,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: lens,
            height: lens,
            borderRadius: 999,
            borderWidth: 2,
            borderColor: color,
          }}
        />
      </View>
    </View>
  );
}

function ProfileGlyph({ color, size }: { color: string; size: number }) {
  const head = size * 0.36;
  return (
    <View style={{ width: size, height: size, alignItems: "center" }}>
      <View
        style={{
          width: head,
          height: head,
          borderRadius: 999,
          borderWidth: 2,
          borderColor: color,
        }}
      />
      <View
        style={{
          marginTop: 2,
          width: size * 0.62,
          height: size * 0.38,
          borderTopLeftRadius: size * 0.35,
          borderTopRightRadius: size * 0.35,
          borderWidth: 2,
          borderBottomWidth: 0,
          borderColor: color,
        }}
      />
    </View>
  );
}

function AnalysisResultScreen({
  result,
  onNewAnalysis,
}: {
  result: AnalyzeRoomResponse;
  onNewAnalysis: () => void;
}) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.resultScrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.resultStyleTitle}>{result.style}</Text>

      <Text style={styles.resultAtmosphere}>{result.atmosphere}</Text>

      <View style={styles.resultScoreWrap}>
        <Text style={styles.resultScoreValue}>
          {Math.min(100, Math.max(0, Math.round(result.score)))}
        </Text>
        <Text style={styles.resultScoreSlash}>/100</Text>
      </View>

      <Text style={styles.resultSectionLabel}>Güçlü yönler</Text>
      <View style={styles.resultList}>
        {(result.strengths ?? []).map((item, i) => (
          <View key={`s-${i}`} style={styles.resultListRow}>
            <Text style={styles.resultTick}>✓</Text>
            <Text style={styles.resultListText}>{item}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.resultSectionLabel, styles.resultSectionSpaced]}>
        Gelişim önerileri
      </Text>
      <View style={styles.resultList}>
        {(result.improvements ?? []).map((item, i) => (
          <View key={`i-${i}`} style={styles.resultListRow}>
            <Text style={styles.resultBullet}>•</Text>
            <Text style={styles.resultSuggestionText}>{item}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.btnNewAnalysis}
        onPress={onNewAnalysis}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Yeni analiz"
      >
        <Text style={styles.btnNewAnalysisText}>Yeni Analiz</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default function App() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] =
    useState<AnalyzeRoomResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const openCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "İzin gerekli",
        "Fotoğraf çekmek için kamera erişimine izin vermeniz gerekiyor."
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      setImageUri(a.uri);
      setImageBase64(a.base64 ?? null);
    }
  }, []);

  const openLibrary = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "İzin gerekli",
        "Galeriden seçmek için fotoğraf kitaplığı erişimine izin vermeniz gerekiyor."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      setImageUri(a.uri);
      setImageBase64(a.base64 ?? null);
    }
  }, []);

  const onAnalyze = useCallback(async () => {
    if (!imageUri) return;
    if (!imageBase64) {
      Alert.alert(
        "Fotoğraf gerekli",
        "Analiz için lütfen fotoğrafı tekrar seçin veya çekin."
      );
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await analyzeRoom(imageBase64);
      setAnalysisResult(result);
    } catch (e) {
      Alert.alert(
        "Analiz başarısız",
        e instanceof Error ? e.message : "Bilinmeyen bir hata oluştu."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageUri, imageBase64]);

  const onNewAnalysis = useCallback(() => {
    setAnalysisResult(null);
    setImageUri(null);
    setImageBase64(null);
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      {analysisResult ? (
        <AnalysisResultScreen
          result={analysisResult}
          onNewAnalysis={onNewAnalysis}
        />
      ) : (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollInner}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.logoWrap}
            accessibilityRole="button"
            accessibilityLabel="Home"
          >
            <View style={styles.logoCircle}>
              <Text style={styles.logoLetter}>n</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Profile"
          >
            <ProfileGlyph color={INK} size={28} />
          </TouchableOpacity>
        </View>

        <Text style={styles.issue}>ISSUE 04 · SPRING</Text>

        <Text style={styles.hero}>NOOK</Text>
        <Text style={styles.tagline}>Small changes. Better spaces.</Text>

        <View
          style={[
            styles.card,
            imageUri ? styles.cardWithImage : null,
            imageUri ? styles.cardSpacingTight : null,
          ]}
        >
          {imageUri ? (
            <>
              <Image
                source={{ uri: imageUri }}
                style={styles.preview}
                resizeMode="cover"
                accessibilityLabel="Seçilen oda fotoğrafı"
              />
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.btnAnalyze}
                accessibilityRole="button"
                accessibilityLabel="Analiz et"
                onPress={onAnalyze}
              >
                <Text style={styles.btnAnalyzeText}>Analiz Et</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <CameraGlyph color={INK} size={56} />
              <Text style={styles.cardTitle}>Upload your room</Text>
              <Text style={styles.cardDesc}>
                Snap your space and we will match pieces that feel right for your
                nook.
              </Text>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.btnPrimary}
                  accessibilityRole="button"
                  accessibilityLabel="Take photo"
                  onPress={openCamera}
                >
                  <Text style={styles.btnPrimaryText}>Take photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.btnOutline}
                  accessibilityRole="button"
                  accessibilityLabel="From library"
                  onPress={openLibrary}
                >
                  <Text style={styles.btnOutlineText}>From library</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {imageUri ? (
          <View style={styles.replaceRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.btnPrimary}
              accessibilityRole="button"
              accessibilityLabel="Take photo"
              onPress={openCamera}
            >
              <Text style={styles.btnPrimaryText}>Take photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.btnOutline}
              accessibilityRole="button"
              accessibilityLabel="From library"
              onPress={openLibrary}
            >
              <Text style={styles.btnOutlineText}>From library</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.recent}>
          <Text style={styles.recentTitle}>RECENT</Text>
          <Text style={styles.recentSub}>Your saved nooks</Text>
        </View>
      </ScrollView>
      )}
      {isAnalyzing ? (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={INK} />
          <Text style={styles.loadingText}>Listening to your room...</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
    paddingTop: Platform.OS === "ios" ? 52 : StatusBar.currentHeight
      ? StatusBar.currentHeight + 12
      : 24,
  },
  scroll: {
    flex: 1,
  },
  scrollInner: {
    paddingHorizontal: 22,
    paddingBottom: 40,
    maxWidth: 430,
    width: "100%",
    alignSelf: "center",
  },
  resultScrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 48,
    maxWidth: 430,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 26,
  },
  logoWrap: {},
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: INK,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: WHITE,
  },
  logoLetter: {
    fontFamily: serif,
    fontSize: 20,
    fontWeight: "600",
    color: INK,
    marginTop: Platform.OS === "android" ? -2 : 0,
  },
  issue: {
    fontFamily: sans,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 3,
    color: INK_SOFT,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  hero: {
    fontFamily: serif,
    fontSize: 52,
    fontWeight: "700",
    color: INK,
    letterSpacing: -0.5,
    lineHeight: 56,
    marginBottom: 8,
  },
  tagline: {
    fontFamily: serif,
    fontSize: 18,
    fontStyle: "italic",
    color: INK,
    opacity: 0.92,
    lineHeight: 26,
    marginBottom: 28,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 28,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: INK_SOFT,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 36,
    shadowColor: INK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    overflow: "hidden",
  },
  cardSpacingTight: {
    marginBottom: 14,
  },
  cardWithImage: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderStyle: "solid",
  },
  preview: {
    width: "100%",
    height: 260,
    backgroundColor: "#E8E4DC",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
  },
  btnAnalyze: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnAnalyzeText: {
    fontFamily: sans,
    fontSize: 16,
    fontWeight: "600",
    color: WHITE,
  },
  cardTitle: {
    fontFamily: sans,
    fontSize: 17,
    fontWeight: "600",
    color: INK,
    marginTop: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  cardDesc: {
    fontFamily: sans,
    fontSize: 14,
    fontWeight: "400",
    color: INK_SOFT,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 22,
    paddingHorizontal: 4,
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  replaceRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginBottom: 36,
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    fontFamily: sans,
    fontSize: 15,
    fontWeight: "600",
    color: WHITE,
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
  btnOutlineText: {
    fontFamily: sans,
    fontSize: 15,
    fontWeight: "600",
    color: INK,
  },
  recent: {
    gap: 6,
  },
  recentTitle: {
    fontFamily: sans,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.4,
    color: INK_SOFT,
    textTransform: "uppercase",
  },
  recentSub: {
    fontFamily: serif,
    fontSize: 17,
    fontWeight: "400",
    color: INK,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(245, 240, 235, 0.94)",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    zIndex: 50,
  },
  loadingText: {
    fontFamily: serif,
    fontSize: 18,
    fontStyle: "italic",
    color: INK,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  resultStyleTitle: {
    fontFamily: serif,
    fontSize: 36,
    fontWeight: "700",
    color: INK,
    lineHeight: 42,
    marginBottom: 20,
  },
  resultSectionLabel: {
    fontFamily: sans,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    color: INK_SOFT,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  resultSectionSpaced: {
    marginTop: 24,
  },
  resultAtmosphere: {
    fontFamily: serif,
    fontSize: 17,
    lineHeight: 26,
    fontStyle: "italic",
    color: INK,
    opacity: 0.92,
    marginBottom: 24,
  },
  resultScoreWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 28,
  },
  resultScoreValue: {
    fontFamily: serif,
    fontSize: 48,
    fontWeight: "700",
    color: INK,
    lineHeight: 52,
  },
  resultScoreSlash: {
    fontFamily: serif,
    fontSize: 22,
    fontWeight: "400",
    color: INK_SOFT,
    marginLeft: 4,
  },
  resultList: {
    gap: 12,
  },
  resultListRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  resultTick: {
    fontSize: 16,
    fontWeight: "700",
    color: TICK_GREEN,
    marginTop: 2,
    width: 20,
  },
  resultListText: {
    flex: 1,
    fontFamily: sans,
    fontSize: 15,
    lineHeight: 22,
    color: INK,
  },
  resultBullet: {
    fontSize: 18,
    color: INK_SOFT,
    marginTop: 1,
    width: 22,
    textAlign: "center",
  },
  resultSuggestionText: {
    flex: 1,
    fontFamily: sans,
    fontSize: 15,
    lineHeight: 22,
    color: INK,
  },
  btnNewAnalysis: {
    marginTop: 32,
    width: "100%",
    backgroundColor: BG,
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: INK_SOFT,
  },
  btnNewAnalysisText: {
    fontFamily: sans,
    fontSize: 16,
    fontWeight: "600",
    color: INK,
  },
});
