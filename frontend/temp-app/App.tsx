import { useState } from "react";
import {
  TouchableOpacity,
  Image,
  ScrollView,
  Text,
  View,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { analyzeRoom, RoomAnalysis } from "./lib/api";

export default function App() {
  const [result, setResult] = useState<RoomAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const handlePickImage = async () => {
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.6,
    });

    if (picked.canceled) return;

    const asset = picked.assets[0];
    setImageUri(asset.uri);

    if (!asset.base64) return;

    try {
      setLoading(true);
      const data = await analyzeRoom(asset.base64);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#F3EBDD", // Premium beige background
      }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 28,
          paddingTop: 38,
          gap: 0,
          minHeight: "100%",
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            alignItems: "flex-start",
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 38,
              fontWeight: "bold",
              color: "#6E5848",
              letterSpacing: 1,
            }}
          >
            NOOK
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: "#988575",
              marginTop: 4,
              fontWeight: "500",
            }}
          >
            Small changes. Better spaces.
          </Text>
        </View>

        {/* Upload Button */}
        <View style={{ alignItems: "center", marginBottom: imageUri ? 28 : 44 }}>
          <TouchableOpacity
            onPress={handlePickImage}
            style={{
              backgroundColor: "#EFE5D3",
              borderRadius: 28,
              paddingVertical: 16,
              paddingHorizontal: 42,
              shadowColor: "#B39B7C",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.09,
              shadowRadius: 6,
              elevation: 4,
              borderWidth: 1.6,
              borderColor: "#E7D9C1",
            }}
            activeOpacity={0.89}
            disabled={loading}
          >
            <Text
              style={{
                fontWeight: "bold",
                letterSpacing: 1,
                fontSize: 17,
                color: loading ? "#BEB5A6" : "#7B614A",
              }}
            >
              {loading ? "Analyzing..." : "Select Room Photo"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Image Preview Card */}
        {imageUri && (
          <View
            style={{
              backgroundColor: "#FCF8F3",
              borderRadius: 22,
              padding: 12,
              marginBottom: 32,
              shadowColor: "#A89E91",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
              alignItems: "center",
            }}
          >
            <Image
              source={{ uri: imageUri }}
              resizeMode="cover"
              style={{
                width: "100%",
                height: 260,
                borderRadius: 16,
                backgroundColor: "#E5D7C5",
              }}
            />
          </View>
        )}

        {/* Result Card */}
        {loading && (
          <View style={{ alignItems: "center", marginVertical: 30 }}>
            <ActivityIndicator size="large" color="#B39B7C" />
            <Text style={{ color: "#96795D", fontSize: 15, marginTop: 10 }}>
              Analyzing your space...
            </Text>
          </View>
        )}

        {!!result && (
          <View
            style={{
              backgroundColor: "#FAF7F2",
              borderRadius: 24,
              padding: 24,
              shadowColor: "#B39B7C",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.045,
              shadowRadius: 9,
              elevation: 3,
              marginBottom: 44,
            }}
          >
            {/* Style/Theme */}
            <Text
              style={{
                fontSize: 26,
                fontWeight: "bold",
                color: "#7B614A",
                letterSpacing: 0.5,
                marginBottom: 4,
              }}
            >
              {result.style}
            </Text>
            {/* Atmosphere */}
            <Text
              style={{
                fontSize: 17,
                color: "#96897A",
                marginBottom: 6,
                fontWeight: "500",
              }}
            >
              {result.atmosphere}
            </Text>
            {/* Score */}
            <View style={{ marginBottom: 17, flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{
                  backgroundColor: "#EFE5D3",
                  color: "#856842",
                  paddingHorizontal: 14,
                  paddingVertical: 4,
                  borderRadius: 99,
                  fontWeight: "bold",
                  fontSize: 16,
                  marginTop: 3,
                }}
              >
                Score: {result.score}/100
              </Text>
            </View>

            {/* Improvements */}
            <Text
              style={{
                fontWeight: "700",
                color: "#7B614A",
                fontSize: 17,
                marginTop: 12,
                marginBottom: 5,
              }}
            >
              Improvements
            </Text>
            <View style={{ marginBottom: 13 }}>
              {result.improvements.map((item, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      color: "#B39B7C",
                      fontSize: 19,
                      fontWeight: "bold",
                      marginRight: 7,
                      marginTop: 1,
                    }}
                  >
                    •
                  </Text>
                  <Text style={{ fontSize: 15.5, color: "#6A5543" }}>{item}</Text>
                </View>
              ))}
            </View>

            {/* Products */}
            <Text
              style={{
                fontWeight: "700",
                color: "#7B614A",
                fontSize: 17,
                marginTop: 10,
                marginBottom: 5,
              }}
            >
              Products
            </Text>
            <View style={{}}>
              {result.products.map((item, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    marginBottom: 3,
                  }}
                >
                  <Text
                    style={{
                      color: "#B39B7C",
                      fontSize: 19,
                      fontWeight: "bold",
                      marginRight: 7,
                      marginTop: 1,
                    }}
                  >
                    •
                  </Text>
                  <Text
                    style={{
                      fontSize: 15.5,
                      color: "#594532",
                      textDecorationLine: "underline",
                      textDecorationColor: "#CEB490",
                      textDecorationStyle: "dotted",
                    }}
                  >
                    {item.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}