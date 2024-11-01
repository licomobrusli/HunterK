// src/styles/containerStyles.ts

import { StyleSheet } from 'react-native';

export const containerStyles = StyleSheet.create({
  // **Containers**
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#004225', // British Racing Green
    paddingHorizontal: 20, // Added padding for better layout
  },
  containerBottom: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  containerRight: {
    position: 'absolute',
    right: 10,
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  subModalContent: {
    width: 300,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  list: {
    flex: 1,
    width: '100%',
  },
});
