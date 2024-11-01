import React from 'react';
import { View, TouchableOpacity,  Dimensions } from 'react-native';
import RNModal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Feather'; // Import Feather icons
import { commonStyles } from '../styles/commonStyles';
import { containerStyles } from '../styles/containerStyles.ts';

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
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      animationIn={animationIn}
      animationOut={animationOut}
      animationInTiming={500}
      animationOutTiming={500}
      avoidKeyboard
      coverScreen
      useNativeDriver
      hideModalContentWhileAnimating
      backdropTransitionOutTiming={0}
      hasBackdrop
      backdropColor="black"
      backdropOpacity={0.7}
      backdropTransitionInTiming={500}
      supportedOrientations={['portrait', 'landscape']}
      style={containerStyles.container}
      customBackdrop={<View />}
      deviceHeight={Dimensions.get('window').height}
      deviceWidth={Dimensions.get('window').width}
      propagateSwipe
    >
      <View style={containerStyles.container}>
        {/* Header with X button */}
        <View style={containerStyles.container}>
          <View style={containerStyles.container} />
          <TouchableOpacity onPress={onClose} style={commonStyles.button} accessibilityLabel="Close modal">
            <Icon name="x" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* Modal content */}
        {children}
      </View>
    </RNModal>
  );
};

export default AppModal;
