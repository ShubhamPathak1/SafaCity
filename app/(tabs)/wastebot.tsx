import { askGemini } from '@/services/geminiTextBot';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeIn, SlideInLeft, SlideInRight } from 'react-native-reanimated';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
};

export default function Wastebot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: 'welcome-message',
      text: "Hi there! I'm WasteBot 🌱\n\nI can help you with:\n• Waste classification\n• Recycling tips\n• Disposal locations\n• Sustainability advice\n\nHow can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const botReplyText = await askGemini(input);
      const botMessage: Message = {
        id: Date.now().toString() + '-bot',
        text: botReplyText,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting bot reply:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, (_, match) => `\u0001${match}\u0001`) // Bold
      .replace(/_(.*?)_/g, (_, match) => `\u0002${match}\u0002`)       // Italic
      .replace(/```(.*?)```/gs, (_, match) => `\u0003${match}\u0003`); // Code block
  };

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\u0001.*?\u0001|\u0002.*?\u0002|\u0003.*?\u0003)/g);
    return parts.map((part, index) => {
      if (part.startsWith('\u0001') && part.endsWith('\u0001')) {
        return (
          <Text key={index} style={styles.boldText}>
            {part.slice(1, -1)}
          </Text>
        );
      } else if (part.startsWith('\u0002') && part.endsWith('\u0002')) {
        return (
          <Text key={index} style={styles.italicText}>
            {part.slice(1, -1)}
          </Text>
        );
      } else if (part.startsWith('\u0003') && part.endsWith('\u0003')) {
        return (
          <View key={index} style={styles.codeBlock}>
            <Text style={styles.codeText}>{part.slice(1, -1)}</Text>
          </View>
        );
      } else {
        return <Text key={index} style={styles.regularText}>{part}</Text>;
      }
    });
  };

  const renderItem = ({ item, index }: { item: Message, index: number }) => (
    <Animated.View 
      entering={item.sender === 'user' ? SlideInRight : SlideInLeft}
      style={[
        styles.messageContainer,
        item.sender === 'user' ? styles.userContainer : styles.botContainer
      ]}
    >
      {item.sender === 'bot' && (
        <View style={styles.botAvatar}>
          <Image 
            source={require('@/assets/images/default-avatar.jpg')} 
            style={styles.avatarImage}
          />
        </View>
      )}
      
      <View style={[
        styles.bubble,
        item.sender === 'user' ? styles.userBubble : styles.botBubble,
        index === messages.length - 1 && styles.lastBubble
      ]}>
        {renderFormattedText(formatText(item.text))}
        <Text style={[
          styles.timestamp,
          item.sender === 'user' ? styles.userTimestamp : styles.botTimestamp
        ]}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      
      {item.sender === 'user' && (
        <View style={styles.userAvatar}>
          <FontAwesome5 name="user" size={16} color="#fff" />
        </View>
      )}
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image 
            source={require('@/assets/images/wastebot-logo.png')} 
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>WasteBot</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="info" size={22} color="#4CAF50" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="history" size={22} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View> */}

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.chatContent}
          keyboardShouldPersistTaps="handled"
          inverted={false}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loading ? (
              <Animated.View 
                entering={FadeIn.duration(300)}
                style={[styles.bubble, styles.botBubble, styles.typingIndicator]}
              >
                <View style={styles.typingContent}>
                  <Image 
                    source={require('@/assets/images/default-avatar.jpg')} 
                    style={styles.typingAvatar}
                  />
                  <View style={styles.typingDots}>
                    <Animated.View 
                      style={[styles.typingDot, { animationDelay: '0s' }]} 
                    />
                    <Animated.View 
                      style={[styles.typingDot, { animationDelay: '0.2s' }]} 
                    />
                    <Animated.View 
                      style={[styles.typingDot, { animationDelay: '0.4s' }]} 
                    />
                  </View>
                </View>
              </Animated.View>
            ) : null
          }
        />

        <View style={styles.inputContainer}>
          {/* <TouchableOpacity style={styles.attachmentButton}>
            <Feather name="paperclip" size={24} color="#4CAF50" />
          </TouchableOpacity> */}
          
          <TextInput
            style={styles.input}
            placeholder="Ask about waste management..."
            placeholderTextColor="#90A4AE"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline
            blurOnSubmit={false}
          />
          
          <TouchableOpacity 
            onPress={handleSend} 
            style={[
              styles.sendButton,
              input.trim() ? styles.activeSendButton : styles.inactiveSendButton
            ]}
            disabled={!input.trim() || loading}
          >
            <Feather 
              name={input.trim() ? "send" : "mic"} 
              size={22} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2E7D32',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 16,
  },
  chatContent: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 12,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 8,
    maxWidth: '85%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  botContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    padding: 14,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
    marginLeft: 8,
  },
  botBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  lastBubble: {
    marginBottom: 20,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 6,
  },
  userTimestamp: {
    textAlign: 'right',
    color: 'rgba(255,255,255,0.7)',
  },
  botTimestamp: {
    textAlign: 'left',
    color: '#90A4AE',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#e0e0e0',
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
  },
  attachmentButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f1f3f4',
    borderRadius: 22,
    fontSize: 16,
    color: '#263238',
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  activeSendButton: {
    backgroundColor: '#4CAF50',
  },
  inactiveSendButton: {
    backgroundColor: '#B0BEC5',
  },
  typingIndicator: {
    alignSelf: 'flex-start',
    padding: 12,
    marginLeft: 8,
  },
  typingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingAvatar: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#78909C',
    marginHorizontal: 3,
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#C8E6C9',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#388E3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  avatarImage: {
    width: 20,
    height: 20,
  },
  boldText: {
    fontWeight: '600',
    color: 'inherit',
  },
  italicText: {
    fontStyle: 'italic',
    color: 'inherit',
  },
  regularText: {
    color: 'inherit',
  },
  codeBlock: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 6,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 14,
    color: '#263238',
  },
});