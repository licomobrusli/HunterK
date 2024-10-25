import React from 'react';
import AssignAudiosModal from './AssignAudiosModal';

type AssignAudiosModalWrapperProps = {
  visible: boolean;
  selectedState: string | null;
  onClose: () => void;
};

const AssignAudiosModalWrapper: React.FC<AssignAudiosModalWrapperProps> = ({
  visible,
  selectedState,
  onClose,
}) => {
  if (!selectedState) {return null;}

  return (
    <AssignAudiosModal
      visible={visible}
      onClose={onClose}
      stateName={selectedState}
    />
  );
};

export default AssignAudiosModalWrapper;
