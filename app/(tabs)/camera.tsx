import { sendToGemini } from "@/services/geminiApi";
import { askGemini } from "@/services/geminiTextBot";
import { addRewardForUser } from "@/utils/rewardStorage";
import { useUser } from '@clerk/clerk-expo';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Button } from "@react-navigation/elements";
import {
  CameraType,
  CameraView,
  useCameraPermissions
} from "expo-camera";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const IMAGE_HEIGHT = 300; // Fixed height for the image
const OVERLAY_INITIAL_HEIGHT = SCREEN_HEIGHT - IMAGE_HEIGHT; // Initial height of overlay

type ChatMessage = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
};

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const ref = useRef<CameraView>(null);
  const [uri, setUri] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [geminiResponse, setGeminiResponse] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isSendingChat, setIsSendingChat] = useState(false);

  const { user } = useUser();
  const username = user?.username || user?.primaryEmailAddress?.emailAddress;

  const formatBotResponse = (text: string) => {
    // Replace markdown formatting with React Native compatible formatting
    const parts = text.split(/(\*\*.*?\*\*|_.*?_|`.*?`)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <Text key={index} style={{ fontWeight: 'bold' }}>
            {part.slice(2, -2)}
          </Text>
        );
      } else if (part.startsWith('_') && part.endsWith('_')) {
        return (
          <Text key={index} style={{ fontStyle: 'italic' }}>
            {part.slice(1, -1)}
          </Text>
        );
      } else if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <Text key={index} style={{ fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' }}>
            {part.slice(1, -1)}
          </Text>
        );
      } else {
        return <Text key={index}>{part}</Text>;
      }
    });
  };

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center" }}>We need your permission to use the camera</Text>
        <Button onPress={requestPermission} title="Grant permission" />
      </View>
    );
  }

  const takePicture = async () => {
    console.log("photo taken");
    setGeminiResponse(null);
    setChatMessages([]);
    setIsLoading(true);

    try {
      const photo = await ref.current?.takePictureAsync();

      if (photo?.uri) {
        setUri(photo.uri);

        const base64 = await FileSystem.readAsStringAsync(photo.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const response = await sendToGemini(base64);
        console.log("Gemini response:", response);

        if (response && typeof response === 'object' && !response.error) {
          setGeminiResponse(response);

          const rewardPoints = typeof response.rewards === 'number' ? response.rewards : 0;
          if (username) {
            await addRewardForUser(username, rewardPoints);
          }

          // Add initial bot message about the scanned item
          setChatMessages([{
            id: '1',
            text: `I've identified this as ${response.name || 'an item'} (${response.waste_type || 'unknown type'}). Ask me anything about how to properly dispose of it!`,
            sender: 'bot'
          }]);
        } else {
          setGeminiResponse({ error: "Could not process waste data. Please try again." });
        }
      }
    } catch (error: any) {
      console.error("Error:", error.message || error);
      setGeminiResponse({ error: "An unexpected error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !geminiResponse) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: chatInput,
      sender: 'user'
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsSendingChat(true);

    try {
      // Include the original scan results in the prompt for context
      const prompt = `About this item: 
      - Name: ${geminiResponse.name}
      - Type: ${geminiResponse.waste_type}
      - Biodegradable: ${geminiResponse.biodegradable}
      - Recyclable: ${geminiResponse.recyclable}
      - Reusable: ${geminiResponse.reusable}
      
      User question: ${chatInput}`;

      const botReply = await askGemini(prompt);
      
      const botMessage: ChatMessage = {
        id: Date.now().toString() + '-bot',
        text: botReply,
        sender: 'bot'
      };

      setChatMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error getting bot reply:", error);
      setChatMessages(prev => [...prev, {
        id: Date.now().toString() + '-error',
        text: "Sorry, I'm having trouble responding. Please try again.",
        sender: 'bot'
      }]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const toggleFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
  };

  const renderChatMessage = (message: ChatMessage) => {
    return (
      <View key={message.id} style={[
        styles.chatBubble,
        message.sender === 'user' ? styles.userBubble : styles.botBubble
      ]}>
        <Text style={message.sender === 'user' ? styles.userText : styles.botText}>
          {message.sender === 'bot' ? formatBotResponse(message.text) : message.text}
        </Text>
      </View>
    );
  };

  const renderPicture = () => {
    return (
      <View style={styles.resultContainer}>
        {/* Fixed Image Background */}
        <View style={styles.imageBackground}>
          <Image
            source={{ uri }}
            contentFit="cover"
            style={styles.backgroundImage}
            transition={200}
          />
        </View>

        {/* Main Scrollable Container */}
        <ScrollView 
          style={styles.mainScrollView}
          contentContainerStyle={styles.mainScrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Spacer to push content below image initially */}
          <View style={styles.imageSpacer} />

          {/* Scrollable Overlay Content */}
          <View style={styles.overlayContent}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />
            
            {/* Toggle between analysis and chat */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[styles.toggleButton, !chatMode && styles.activeToggle]}
                onPress={() => setChatMode(false)}
              >
                <Text style={!chatMode ? styles.activeToggleText : styles.inactiveToggleText}>Analysis</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleButton, chatMode && styles.activeToggle]}
                onPress={() => setChatMode(true)}
              >
                <Text style={chatMode ? styles.activeToggleText : styles.inactiveToggleText}>Ask WasteBot</Text>
              </TouchableOpacity>
            </View>

            {chatMode ? (
              <KeyboardAvoidingView
                style={styles.chatModeContainer}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 150}
              >
                <View style={styles.chatContainer}>
                  {chatMessages.map(renderChatMessage)}
                  {isSendingChat && (
                    <View style={[styles.chatBubble, styles.botBubble]}>
                      <Text style={styles.botText}>...</Text>
                    </View>
                  )}
                </View>

                <View style={styles.chatInputContainer}>
                  <TextInput
                    style={styles.chatInput}
                    placeholder="Ask about this item..."
                    value={chatInput}
                    onChangeText={setChatInput}
                    onSubmitEditing={handleSendChat}
                    returnKeyType="send"
                  />
                  <TouchableOpacity 
                    style={styles.sendButton}
                    onPress={handleSendChat}
                    disabled={isSendingChat}
                  >
                    <FontAwesome6 name="paper-plane" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            ) : (
              <View style={styles.analysisContainer}>
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                    <Text style={styles.loadingText}>Analyzing your waste...</Text>
                  </View>
                ) : geminiResponse ? (
                  geminiResponse.error ? (
                    <View style={styles.errorContainer}>
                      <FontAwesome6 name="triangle-exclamation" size={24} color="#FF5722" />
                      <Text style={styles.errorText}>{geminiResponse.error}</Text>
                    </View>
                  ) : (
                    <View>
                      <Text style={styles.sectionTitle}>Waste Analysis</Text>
                      
                      {/* Waste Type Card */}
                      <View style={[styles.infoCard, { backgroundColor: '#E8F5E9' }]}>
                        <Text style={styles.infoCardTitle}>Type</Text>
                        <Text style={styles.infoCardValue}>
                          {geminiResponse.waste_type || 'N/A'}
                        </Text>
                      </View>
                      
                      {/* Waste Name */}
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Name:</Text>
                        <Text style={styles.detailValue}>{geminiResponse.name || 'N/A'}</Text>
                      </View>
                      
                      {/* Properties Grid */}
                      <View style={styles.propertiesGrid}>
                        <View style={[styles.propertyBadge, geminiResponse.biodegradable === 'Yes' ? styles.positiveBadge : styles.negativeBadge]}>
                          <Text style={styles.propertyBadgeText}>Biodegradable</Text>
                          <Text style={styles.propertyBadgeValue}>{geminiResponse.biodegradable || 'N/A'}</Text>
                        </View>
                        
                        <View style={[styles.propertyBadge, geminiResponse.recyclable === 'Yes' ? styles.positiveBadge : styles.negativeBadge]}>
                          <Text style={styles.propertyBadgeText}>Recyclable</Text>
                          <Text style={styles.propertyBadgeValue}>{geminiResponse.recyclable || 'N/A'}</Text>
                        </View>
                        
                        <View style={[styles.propertyBadge, geminiResponse.reusable === 'Yes' ? styles.positiveBadge : styles.negativeBadge]}>
                          <Text style={styles.propertyBadgeText}>Reusable</Text>
                          <Text style={styles.propertyBadgeValue}>{geminiResponse.reusable || 'N/A'}</Text>
                        </View>
                        
                        <View style={[styles.propertyBadge, geminiResponse.should_be_burned === 'Yes' ? styles.warningBadge : styles.negativeBadge]}>
                          <Text style={styles.propertyBadgeText}>Should Burn</Text>
                          <Text style={styles.propertyBadgeValue}>{geminiResponse.should_be_burned || 'N/A'}</Text>
                        </View>
                      </View>
                      
                      {/* Additional Info */}
                      {geminiResponse.should_be_burned === "No" && geminiResponse.reason_for_not_burning && (
                        <View style={styles.additionalInfo}>
                          <Text style={styles.additionalInfoText}>
                            {geminiResponse.reason_for_not_burning}
                          </Text>
                        </View>
                      )}
                      
                      {geminiResponse.notes && (
                        <View style={styles.notesContainer}>
                          <Text style={styles.notesTitle}>Notes:</Text>
                          <Text style={styles.notesText}>{geminiResponse.notes}</Text>
                        </View>
                      )}
                      
                      {/* Reward Points */}
                      <View style={styles.rewardContainer}>
                        <Text style={styles.rewardTitle}>You Earned</Text>
                        <View style={styles.rewardPoints}>
                          <FontAwesome6 name="coins" size={24} color="#FFD700" />
                          <Text style={styles.rewardValue}>
                            {geminiResponse.rewards || 0} Points
                          </Text>
                        </View>
                      </View>
                    </View>
                  )
                ) : null}
              </View>
            )}

            {/* Action Buttons - Always at bottom */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.scanAgainButton}
                onPress={() => { setUri(null); setGeminiResponse(null); setChatMessages([]); }}
              >
                <FontAwesome6 name="camera-rotate" size={20} color="white" />
                <Text style={styles.scanAgainButtonText}>Scan Another</Text>
              </TouchableOpacity>
              
              {geminiResponse?.waste_type && (
                <TouchableOpacity 
                  style={styles.disposalSitesButton}
                  onPress={() => {
                    router.push({
                      pathname: '/maps',
                      params: { type: geminiResponse.waste_type }
                    });
                  }}
                >
                  <FontAwesome6 name="map-location-dot" size={20} color="white" />
                  <Text style={styles.disposalSitesButtonText}>Disposal Sites</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderCamera = () => {
    return (
      <View style={{ flex: 1, width: "100%" }}>
        <CameraView
          style={StyleSheet.absoluteFill}
          ref={ref}
          mode="picture"
          facing={facing}
          mute={false}
          responsiveOrientationWhenOrientationLocked
        />

        <View style={styles.shutterContainer}>
          <Pressable onPress={takePicture}>
            {({ pressed }) => (
              <View style={[styles.shutterBtn, { opacity: pressed ? 0.5 : 1 }]}>
                <View style={styles.shutterBtnInner} />
              </View>
            )}
          </Pressable>
        </View>
      </View>
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
  shutterContainer: {
    position: "absolute",
    bottom: 44,
    left: 0,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
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
  resultContainer: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  // Image as background
  imageBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: IMAGE_HEIGHT,
    zIndex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  // Main scrollable container
  mainScrollView: {
    flex: 1,
    zIndex: 2,
  },
  mainScrollContent: {
    flexGrow: 1,
  },
  imageSpacer: {
    height: IMAGE_HEIGHT - 30, // Space for image minus overlap
  },
  overlayContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: SCREEN_HEIGHT - IMAGE_HEIGHT + 100, // Ensure enough content to scroll
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#4CAF50',
  },
  activeToggleText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inactiveToggleText: {
    color: '#666',
  },
  // Chat mode styles
  chatModeContainer: {
    minHeight: 400,
    paddingBottom: 20,
  },
  chatContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  chatContent: {
    paddingBottom: 20,
  },
  chatBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5ea',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  chatInput: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginRight: 8,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botText: {
    color: '#000',
    lineHeight: 20,
  },
  userText: {
    color: 'white',
    lineHeight: 20,
  },
  // Analysis mode styles
  analysisScrollView: {
    flex: 1,
  },
  analysisContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  errorText: {
    marginLeft: 12,
    color: '#D32F2F',
    fontSize: 16,
  },
  analysisContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoCardTitle: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 4,
  },
  infoCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#616161',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  propertiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  propertyBadge: {
    width: '48%',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  positiveBadge: {
    backgroundColor: '#E8F5E9',
  },
  negativeBadge: {
    backgroundColor: '#F5F5F5',
  },
  warningBadge: {
    backgroundColor: '#FFF3E0',
  },
  propertyBadgeText: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 4,
  },
  propertyBadgeValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  additionalInfo: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  additionalInfoText: {
    fontSize: 14,
    color: '#0D47A1',
  },
  notesContainer: {
    marginTop: 16,
    backgroundColor: '#FFF9C4',
    padding: 12,
    borderRadius: 8,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F57F17',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#5D4037',
  },
  rewardContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  rewardTitle: {
    fontSize: 16,
    color: '#616161',
    marginBottom: 8,
  },
  rewardPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFDE7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFD600',
  },
  rewardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F57F17',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  scanAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  scanAgainButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disposalSitesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
  },
  disposalSitesButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});