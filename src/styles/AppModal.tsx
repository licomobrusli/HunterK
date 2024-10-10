// src/styles/AppModal.tsx

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import RNModal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Feather'; // Import Feather icons
import { commonStyles } from '../styles/commonStyles';

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
  animationIn = 'zoomIn',
  animationOut = 'slideOutRight',
}) => {
  return (
    <RNModal
      isVisible={isVisible}
      onBackdropPress={onClose} // Allow closing by tapping outside
      onBackButtonPress={onClose} // Allow closing with back button (Android)
      animationIn={animationIn}
      animationOut={animationOut}
      useNativeDriver
      hideModalContentWhileAnimating
      backdropTransitionOutTiming={0}
      style={styles.modalStyle}
    >
      <View style={commonStyles.modalContent}>
        {/* Header with X button */}
        <View style={styles.header}>
          <View style={styles.flexSpacer} />
          <TouchableOpacity onPress={onClose} style={styles.closeButton} accessibilityLabel="Close modal">
            <Icon name="x" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* Modal content */}
        {children}
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  modalStyle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  closeButton: {
    padding: 5,
  },
  flexSpacer: {
    flex: 1,
  },
});

export default AppModal;
