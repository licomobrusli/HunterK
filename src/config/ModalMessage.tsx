// src/components/ModalMessage.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import { textStyles } from '../styles/textStyles';

type ModalMessageProps = {
  message: string;
  type: 'success' | 'error';
};

const ModalMessage: React.FC<ModalMessageProps> = ({ message, type }) => {
  return (
    <View style={[commonStyles.container, type === 'success' ? commonStyles.success : commonStyles.error]}>
      <Text style={textStyles.text0}>{message}</Text>
    </View>
  );
};

export default ModalMessage;
