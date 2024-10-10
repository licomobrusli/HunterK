// src/styles/AppModal.tsx

import React from 'react';
import { View, ScrollView } from 'react-native';
import RNModal from 'react-native-modal';
import { commonStyles } from '../styles/commonStyles';

// Define the allowed animation types based on react-native-modal's supported animations
type AnimationInTypes =
  | 'slideInUp'
  | 'slideInDown'
  | 'slideInLeft'
  | 'slideInRight'
  | 'fadeIn'
  | 'zoomIn'
  | 'bounceIn'
  | 'bounceInDown'
  | 'bounceInUp'
  | 'flipInX'
  | 'flipInY'
  | 'lightSpeedIn'
  | 'rotate'
  | 'zoomInDown'
  | 'zoomInUp';

type AnimationOutTypes =
  | 'slideOutUp'
  | 'slideOutDown'
  | 'slideOutLeft'
  | 'slideOutRight'
  | 'fadeOut'
  | 'zoomOut'
  | 'bounceOut'
  | 'bounceOutDown'
  | 'bounceOutUp'
  | 'flipOutX'
  | 'flipOutY'
  | 'lightSpeedOut'
  | 'rotate'
  | 'zoomOutDown'
  | 'zoomOutUp';

type AppModalProps = {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  animationIn?: AnimationInTypes;
  animationOut?: AnimationOutTypes;
};

const AppModal: React.FC<AppModalProps> = ({
  isVisible,
  onClose,
  children,
  animationIn = 'slideInUp',
  animationOut = 'slideOutDown',
}) => {
  return (
    <RNModal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      animationIn={animationIn}
      animationOut={animationOut}
      useNativeDriver
      hideModalContentWhileAnimating
      backdropTransitionOutTiming={0}
      style={styles.modalStyle}
    >
      <View style={commonStyles.modalContent}>
        <ScrollView contentContainerStyle={commonStyles.modalScrollView}>
          {children}
        </ScrollView>
      </View>
    </RNModal>
  );
};

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  modalStyle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppModal;
