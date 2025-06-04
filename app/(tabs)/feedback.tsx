
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';

export default function FeedbackScreen() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!email || !message) {
      Alert.alert('Missing Fields', 'Please fill out both email and message.');
      return;
    }

    setSubmitting(true);
    setResult('Sending...');

    const formData = new FormData();
    formData.append('access_key', 'YOUR_ACCESS_KEY_HERE'); // Replace with your Web3Forms key
    formData.append('email', email);
    formData.append('message', message);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult('✅ Feedback submitted successfully!');
        setEmail('');
        setMessage('');
      } else {
        console.log('Web3Forms Error:', data);
        setResult(data.message || '❌ Submission failed.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setResult('❌ An error occurred while submitting the form.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>Give a Feedback to Government 💬</Text>

      <Text style={styles.label}>Your Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="example@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        placeholderTextColor="#9ca3af"
      />

      <Text style={styles.label}>Your Message</Text>
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="What's your suggestion or complain?"
        multiline
        numberOfLines={5}
        style={[styles.input, styles.textArea]}
        placeholderTextColor="#9ca3af"
      />

      <TouchableOpacity
        style={[styles.button, submitting && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? 'Sending...' : 'Submit Feedback'}
        </Text>
      </TouchableOpacity>

      {!!result && (
        <Text
          style={[
            styles.resultText,
            result.includes('✅') ? styles.success : styles.error,
          ]}
        >
          {result}
        </Text>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f0fdf4',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    color: '#14532d',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#14532d',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    color: '#111827',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  resultText: {
    fontSize: 16,
    marginTop: 20,
    fontWeight: '500',
  },
  success: {
    color: '#16a34a',
  },
  error: {
    color: '#dc2626',
  },
});
