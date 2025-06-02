import { sendToGemini } from "@/services/geminiApi";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {
  CameraMode,
  CameraType,
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import { useRef, useState } from "react";
import { ActivityIndicator, Button, Pressable, StyleSheet, Text, View } from "react-native";

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [facing, setFacing] = useState<CameraType>("back");
  const [recording, setRecording] = useState(false);
  // const [geminiResponse, setGeminiResponse] = useState("");
   const [geminiResponse, setGeminiResponse] = useState<any | null>(null);
   const [isLoading, setIsLoading] = useState(false);

  if (!permission) {
    return null;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const takePicture = async () => {
    setGeminiResponse(null); // Clear previous response
    setIsLoading(true); // Start loading
    try {
    const photo = await ref.current?.takePictureAsync();

    if (photo?.uri) {
      setUri(photo.uri);

      // Convert to base64
      const base64 = await FileSystem.readAsStringAsync(photo.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // console.log(base64)

      // Send to Gemini API
      const response = await sendToGemini(base64);
      console.log("Gemini response:", response);

       if (response && typeof response === 'object' && !response.error) {
            setGeminiResponse(response);
        } else {
            // Handle cases where parsing failed or Gemini returned an error
            setGeminiResponse({ error: "Could not process waste data. Please try again." });
            console.error("Issue with Gemini response:", response);
        }

      // You could show this response in UI using state
      // setGeminiResponse(response); 
    }
  } catch (error) {
      console.error("Error taking picture or sending to Gemini:", error);
      // setGeminiResponse({ error: `An unexpected error occurred: ${error.message || error}` });
  }finally {
        setIsLoading(false); // Stop loading
    }

  };


  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  // const renderPicture = () => {
  //   return (
  //     <View>
  //       <Image
  //         source={{ uri }}
  //         contentFit="contain"
  //         style={{ width: 300, aspectRatio: 1 }}
  //       />
  //       <Text>{geminiResponse}</Text>
  //       <Button onPress={() => setUri(null)} title="Scan Another Waste" />
  //     </View>
  //   );
  // };
  const renderPicture = () => {
    return (
      <View >
        <Image
          source={{ uri }}
          contentFit="contain"
          style={{ width: 300, aspectRatio: 1 }}
        />
        {isLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : geminiResponse ? (
          geminiResponse.error ? (
            <Text >{geminiResponse.error}</Text>
          ) : (
            <View >
              <Text >Waste Analysis:</Text>
              <Text >Type: {geminiResponse.waste_type || 'N/A'}</Text>
              <Text >Name: {geminiResponse.name || 'N/A'}</Text>
              <Text >Biodegradable: {geminiResponse.biodegradable || 'N/A'}</Text>
              <Text >Recyclable: {geminiResponse.recyclable || 'N/A'}</Text>
              <Text >Reusable: {geminiResponse.reusable || 'N/A'}</Text>
              <Text >Should be Burned: {geminiResponse.should_be_burned || 'N/A'}</Text>
              {geminiResponse.should_be_burned === "No" && geminiResponse.reason_for_not_burning && (
                <Text>Reason: {geminiResponse.reason_for_not_burning}</Text>
              )}
              {geminiResponse.notes && (
                <Text >Notes: {geminiResponse.notes}</Text>
              )}
            </View>
          )
        ) : null}

        <Button onPress={() => { setUri(null); setGeminiResponse(null); }} title="Scan Another Waste" />
      </View>
    );
  };

  const renderCamera = () => {
    return (
      <CameraView
        style={styles.camera}
        ref={ref}
        mode={mode}
        facing={facing}
        mute={false}
        responsiveOrientationWhenOrientationLocked
      >
        <View style={styles.shutterContainer}>
          <Pressable onPress={mode === "picture" ? takePicture : recordVideo}>
            {({ pressed }) => (
              <View
                style={[
                  styles.shutterBtn,
                  {
                    opacity: pressed ? 0.5 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.shutterBtnInner,
                    {
                      backgroundColor: mode === "picture" ? "white" : "red",
                    },
                  ]}
                />
              </View>
            )}
          </Pressable>
          <Pressable onPress={toggleFacing}>
            <FontAwesome6 name="rotate-left" size={32} color="white" />
          </Pressable>
        </View>
      </CameraView>
    );
  };

  return (
    <View style={styles.container}>
      {uri ? renderPicture() : renderCamera()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  shutterBtn: {
    backgroundColor: "transparent",
    borderWidth: 5,
    borderColor: "white",
    width: 85,
    height: 85,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterBtnInner: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
});