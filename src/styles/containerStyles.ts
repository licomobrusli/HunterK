// src/styles/containerStyles.ts

import { StyleSheet } from 'react-native';

export const containerStyles = StyleSheet.create({
  // **Containers**
  container: {
    flexGrow: 1,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#004225', // British Racing Green
    padding: 5,
  },
  containerBottom: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center', // Ensure the container is centered
    width: '90%', // Adjust width if needed
    borderColor: '#ccc',
    borderWidth: 1,
  },
  containerLeft: {
    flexDirection: 'row',
    alignContent: 'flex-start',
    borderColor: '#fff',
    borderWidth: 1,
  },
  containerRight: {
    flexDirection: 'row',
    alignContent: 'flex-end',
    alignSelf: 'flex-end',
    borderColor: '#fff',
    borderWidth: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  list: {
    flex: 1,
    width: '100%',
  },
});
