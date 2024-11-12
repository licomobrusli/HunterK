// src/styles/buttonStyles.ts

import { StyleSheet } from 'react-native';

export const buttonStyles = StyleSheet.create({
  // **Buttons**
  button: {
    backgroundColor: '#004225',
    padding: 10,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonWide: {
    width: '100%',
    backgroundColor: '#004225',
    padding: 10,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  disabledButton: {
    backgroundColor: '#B0B0B0',
    padding: 10,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  iconButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    textAlignVertical: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    padding: 1,
    paddingHorizontal: 0,
    textAlign: 'center',
    borderRadius: 1,
    backgroundColor: '#004225',
  },
  iconButton2: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    textAlignVertical: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#fff',
    padding: 1,
    paddingHorizontal: 0,
    textAlign: 'center',
    borderRadius: 1,
    backgroundColor: '#004225',
  },
  timeButton: {
    width: 60,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'white',
    padding: 1,
    textAlign: 'center',
    borderRadius: 1,
    color: 'white',
  },
  innerRadialStyle: {
    borderWidth: 2, // Adjust border width as needed
    borderColor: '#fff', // Matches your theme
    margin: 0, // Remove any margins
    padding: 0,
  },
});
