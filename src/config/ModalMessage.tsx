// src/components/ModalMessage.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type ModalMessageProps = {
  message: string;
  type: 'success' | 'error';
};

const ModalMessage: React.FC<ModalMessageProps> = ({ message, type }) => {
  return (
    <View style={[styles.container, type === 'success' ? styles.success : styles.error]}>
      <Text style={styles.messageText}>{message}</Text>
    </View>
  );
};

export default ModalMessage;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 5,
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    zIndex: 1000,
  },
  success: {
    backgroundColor: '#4CAF50',
  },
  error: {
    backgroundColor: '#F44336',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
