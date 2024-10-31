import { commonStyles } from '../styles/commonStyles';

// src/components/ModalMessage.tsx
import React from 'react';
import { View, Text } from 'react-native';

type ModalMessageProps = {
  message: string;
  type: 'success' | 'error';
};

const ModalMessage: React.FC<ModalMessageProps> = ({ message, type }) => {
  return (
    <View style={[commonStyles.container, type === 'success' ? commonStyles.success : commonStyles.error]}>
      <Text style={commonStyles.text0}>{message}</Text>
    </View>
  );
};

export default ModalMessage;
