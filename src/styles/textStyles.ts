// src/styles/textStyles.ts

import { StyleSheet } from 'react-native';

export const textStyles = StyleSheet.create({

  text1: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  text0: {
    textAlignVertical: 'center',
    textAlign: 'center',
    fontSize: 16,
    color: '#FFFFFF',
  },
  greenText: {
    color: 'green',
  },
  textA: {
    position: 'absolute',
    textAlignVertical: 'center',
    textAlign: 'center',
    color: '#fff',
    fontSize: 10,
  },
  boldText0: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  boldText1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    alignSelf: 'center',
  },
  italicText: {
    color: '#fff',
    fontStyle: 'italic',
  },
});
