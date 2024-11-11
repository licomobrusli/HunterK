// src/config/RadialElement.tsx

import React from 'react';
import { View } from 'react-native';
import RadialLabelsRow from '../RadialLabelsRow';
import RadialOptionsRow from '../RadialOptionsRow';
import { DebriefElement } from '../../types/Debriefing';
import { paddingStyles } from '../../styles/paddingStyles';

interface RadialElementProps {
  element: DebriefElement;
  responses: { [key: string]: any };
  setResponses: React.Dispatch<React.SetStateAction<{ [key: string]: any }>>;
}

const RadialElement: React.FC<RadialElementProps> = ({
  element,
  responses,
  setResponses,
}) => {
  const prompt = element.prompt;
  const labels = element.options || [];

  // Ensure exactly 5 labels; fill with empty strings if fewer
  const paddedLabels = Array.from({ length: 5 }, (_, i) => labels[i] || '');

  const selectedOptions: string[] = responses[element.id] || [];

  const handleToggleOption = (label: string) => {
    setResponses((prevResponses) => {
      const currentSelected = prevResponses[element.id] || [];
      if (currentSelected.includes(label)) {
        return {
          ...prevResponses,
          [element.id]: currentSelected.filter((o: string) => o !== label),
        };
      } else {
        return {
          ...prevResponses,
          [element.id]: [...currentSelected, label],
        };
      }
    });
  };

  return (
    <View style={paddingStyles.padV10}>
      {/* Radial Labels Row */}
      <RadialLabelsRow labels={paddedLabels} />

      {/* Radial Options Row */}
      <RadialOptionsRow
        prompt={prompt}
        labels={paddedLabels}
        selectedOptions={selectedOptions}
        onToggleOption={handleToggleOption}
      />
    </View>
  );
};

export default RadialElement;
