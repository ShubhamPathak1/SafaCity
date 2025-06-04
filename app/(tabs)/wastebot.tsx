
import { askGemini } from '@/services/geminiTextBot';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

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
      // Optionally add an error message to the chat
    } finally {
      setLoading(false);
    }
  };

  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, (_, match) => `\u0001${match}\u0001`) // Bold
      .replace(/_(.*?)_/g, (_, match) => `\u0002${match}\u0002`);       // Italic
  };

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\u0001.*?\u0001|\u0002.*?\u0002)/g);
    return parts.map((part, index) => {
      if (part.startsWith('\u0001') && part.endsWith('\u0001')) {
        return (
          <Text key={index} style={{ fontWeight: 'bold' }}>
            {part.slice(1, -1)}
          </Text>
        );
      } else if (part.startsWith('\u0002') && part.endsWith('\u0002')) {
        return (
          <Text key={index} style={{ fontStyle: 'italic' }}>
            {part.slice(1, -1)}
          </Text>
        );
      } else {
        return <Text key={index}>{part}</Text>;
      }
    });
  };

  const renderItem = ({ item }: { item: Message }) => (
    <Animated.View 
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
      style={styles.messageContainer}
    >
      <View
        style={[
          styles.bubble,
          item.sender === 'user' ? styles.userBubble : styles.botBubble,
        ]}
      >
        {renderFormattedText(formatText(item.text))}
      </View>
      <Text style={[
        styles.timestamp,
        item.sender === 'user' ? styles.userTimestamp : styles.botTimestamp
      ]}>
        {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.chatContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.chatContent}
            keyboardShouldPersistTaps="handled"
            inverted={false}
            showsVerticalScrollIndicator={false}
          />

          {loading && (
            <Animated.View 
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(300)}
              style={[styles.bubble, styles.botBubble, styles.typingIndicator]}
            >
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
              <View style={styles.typingDot} />
            </Animated.View>
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask WasteBot anything..."
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline
          />
          <TouchableOpacity 
            onPress={handleSend} 
            style={styles.sendButton}
            disabled={loading}
          >
            <Text style={{ color: '#fff' }}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f8'
  },
  container: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  chatContent: {
    paddingTop: 12,
    paddingBottom: 80,
  },
  messageContainer: {
    marginVertical: 6,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e5ea',
    borderBottomLeftRadius: 4,
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
  },
  userTimestamp: {
    textAlign: 'right',
    marginRight: 8,
  },
  botTimestamp: {
    textAlign: 'left',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'android' ? 20 : 10,
  },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#888',
    marginHorizontal: 2,
  },
});