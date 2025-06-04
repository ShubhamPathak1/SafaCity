

import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import * as React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [code, setCode] = React.useState('');
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setError(null);

    try {
      await signUp.create({
        emailAddress,
        password,
        username,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.errors?.[0]?.message || 'Sign-up failed');
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    setError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/');
      } else {
        console.warn('Verification step incomplete:', result);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.errors?.[0]?.message || 'Verification failed');
    }
  };

  const commonInputProps = {
    style: styles.input,
    placeholderTextColor: '#9ca3af',
  };

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <Text style={styles.heading}>Verify Your Email 📩</Text>

        <TextInput
          {...commonInputProps}
          value={code}
          placeholder="Enter verification code"
          onChangeText={setCode}
          keyboardType="number-pad"
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.button} onPress={onVerifyPress}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.heading}>Create Account 👤</Text>
      <Text style={styles.subheading}>Sign Up</Text>

      <TextInput
        {...commonInputProps}
        placeholder="Email"
        value={emailAddress}
        onChangeText={setEmailAddress}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        {...commonInputProps}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

      <TextInput
        {...commonInputProps}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={onSignUpPress}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Link href="/(auth)/sign-in">
          <Text style={styles.link}> Sign in</Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  heading: {
    fontSize: 30,
    fontWeight: '700',
    color: '#14532d',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 16,
    color: '#4ade80',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#d1fae5',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  button: {
    backgroundColor: '#34A853',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#34A853',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  error: {
    color: '#dc2626',
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#14532d',
  },
  link: {
    color: '#22c55e',
    fontWeight: '600',
  },
});
