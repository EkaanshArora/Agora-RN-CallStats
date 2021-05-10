import { Dimensions, StyleSheet } from 'react-native';

const dimensions = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
};

export default StyleSheet.create({
  buttonHolder: {
    height: 100,
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0093E9',
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
  },
  fullView: {
    width: dimensions.width,
    height: dimensions.height - 100,
  },
  remoteContainer: {
    width: '100%',
    height: 200,
    position: 'absolute',
    top: 5,
  },
  remote: {
    width: 200,
    height: 200,
    marginHorizontal: 2.5,
  },
  max: {
    flex: 2,
  },
  flex1: {
    flex: 1,
    padding: 5,
  },
  remoteStatsContainer: {
    position: 'absolute',
    zIndex: 55,
    width: 200,
    height: 200,
    backgroundColor: '#ffffff55',
    marginLeft: 2.5,
    padding: 5,
  },
  remoteScroll: {
    paddingHorizontal: 2.5,
  },
  localStatContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  headingText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
