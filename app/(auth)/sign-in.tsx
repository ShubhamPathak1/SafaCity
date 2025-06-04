// import { useSignIn } from '@clerk/clerk-expo';
// import { Link, useRouter } from 'expo-router';
// import React from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

// export default function SignInPage() {
//   const { signIn, setActive, isLoaded } = useSignIn();
//   const router = useRouter();

//   const [identifier, setIdentifier] = React.useState('');
//   const [password, setPassword] = React.useState('');
//   const [error, setError] = React.useState<string | null>(null);

//   const onSignInPress = async () => {
//     if (!isLoaded) return;

//     try {
//       const result = await signIn.create({
//         identifier, // username or email
//         password,
//       });

//       if (result.status === 'complete') {
//         await setActive({ session: result.createdSessionId });
//         router.replace('/');
//       } else {
//         console.warn('Additional steps required:', result);
//       }
//     } catch (err: any) {
//       setError(err.errors?.[0]?.message || 'Sign-in failed. Please try again.');
//       console.error('Sign-in error:', err);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.heading}>Sign In</Text>

//       <TextInput
//         style={styles.input}
//         autoCapitalize="none"
//         autoCorrect={false}
//         placeholder="Email or Username"
//         value={identifier}
//         onChangeText={setIdentifier}
//       />

//       <TextInput
//         style={styles.input}
//         placeholder="Password"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//       />

//       {error && <Text style={styles.error}>{error}</Text>}

//       <TouchableOpacity style={styles.button} onPress={onSignInPress}>
//         <Text style={styles.buttonText}>Continue</Text>
//       </TouchableOpacity>

//       <View style={styles.signup}>
//         <Text>Don't have an account?</Text>
//         <Link href="/(auth)/sign-up">
//           <Text style={styles.signupLink}> Sign Up</Text>
//         </Link>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 20, marginTop: 80 },
//   heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
//   input: {
//     borderColor: '#ccc',
//     borderWidth: 1,
//     padding: 12,
//     marginBottom: 16,
//     borderRadius: 6,
//   },
//   button: {
//     backgroundColor: '#1e90ff',
//     padding: 14,
//     borderRadius: 6,
//     alignItems: 'center',
//     marginTop: 12,
//   },
//   buttonText: { color: '#fff', fontWeight: 'bold' },
//   error: { color: 'red', marginBottom: 12 },
//   signup: { flexDirection: 'row', marginTop: 24, justifyContent: 'center' },
//   signupLink: { color: '#1e90ff', fontWeight: 'bold' },
// });

import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const result = await signIn.create({ identifier, password });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.replace('/');
      } else {
        console.warn('Additional steps required:', result);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Sign-in failed. Please try again.');
      console.error('Sign-in error:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.heading}>Welcome Back 👋</Text>
      <Text style={styles.subheading}>Sign in to continue</Text>

      <TextInput
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Email or Username"
        value={identifier}
        onChangeText={setIdentifier}
        placeholderTextColor="#9ca3af"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#9ca3af"
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={onSignInPress}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <View style={styles.signup}>
        <Text style={styles.signupText}>Don't have an account?</Text>
        <Link href="/(auth)/sign-up">
          <Text style={styles.signupLink}> Sign Up</Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    backgroundColor: '#f0fdf4',
  },
  heading: {
    fontSize: 32,
    fontWeight: '700',
    color: '#14532d',
    marginBottom: 6,
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
    marginBottom: 16,
    fontSize: 16,
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
    marginTop: 8,
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
    marginBottom: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  signup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    color: '#14532d',
  },
  signupLink: {
    color: '#22c55e',
    fontWeight: '600',
  },
});
