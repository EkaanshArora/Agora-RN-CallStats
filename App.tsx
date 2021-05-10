import React, { Component } from 'react';
import {
  FlatList,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RtcEngine, {
  LocalVideoStats,
  RemoteVideoStats,
  RtcLocalView,
  RtcRemoteView,
  RtcStats,
  VideoRenderMode,
} from 'react-native-agora';

import requestCameraAndAudioPermission from './components/Permission';
import styles from './components/Style';

interface Props {}

/**
 * @property peerIds Array for storing connected peers
 * @property appId
 * @property channelName Channel Name for the current session
 * @property joinSucceed State variable for storing success
 */
interface State {
  appId: string;
  token: string | null;
  channelName: string;
  joinSucceed: boolean;
  peerIds: number[];
  remoteStats: { [uid: number]: RemoteVideoStats };
  rtcStats: RtcStats | {};
  localStats: LocalVideoStats | {};
  showStats: boolean;
}

export default class App extends Component<Props, State> {
  _engine?: RtcEngine;

  constructor(props) {
    super(props);
    this.state = {
      appId: YourAppId,
      token: YourToken,
      channelName: 'channel-x',
      joinSucceed: false,
      peerIds: [],
      remoteStats: {},
      rtcStats: {},
      localStats: {},
      showStats: false,
    };
    if (Platform.OS === 'android') {
      // Request required permissions from Android
      requestCameraAndAudioPermission().then(() => {
        console.log('requested!');
      });
    }
  }

  componentDidMount() {
    this.init();
  }

  /**
   * @name init
   * @description Function to initialize the Rtc Engine, attach event listeners and actions
   */
  init = async () => {
    const { appId } = this.state;
    this._engine = await RtcEngine.create(appId);
    await this._engine.enableVideo();

    this._engine.addListener('Warning', (warn) => {
      console.log('Warning', warn);
    });

    this._engine.addListener('Error', (err) => {
      console.log('Error', err);
    });

    this._engine.addListener('RemoteVideoStats', (stats) => {
      this.setState({
        remoteStats: { ...this.state.remoteStats, [stats.uid]: stats },
      });
    });

    this._engine.addListener('RtcStats', (stats) => {
      this.setState({
        rtcStats: stats,
      });
    });

    this._engine.addListener('LocalVideoStats', (stats) => {
      this.setState({
        localStats: stats,
      });
    });

    this._engine.addListener('UserJoined', (uid, elapsed) => {
      console.log('UserJoined', uid, elapsed);
      // Get current peer IDs
      const { peerIds } = this.state;
      // If new user
      if (peerIds.indexOf(uid) === -1) {
        this.setState({
          // Add peer ID to state array
          peerIds: [...peerIds, uid],
        });
      }
    });

    this._engine.addListener('UserOffline', (uid, reason) => {
      console.log('UserOffline', uid, reason);
      const { peerIds } = this.state;
      this.setState({
        // Remove peer ID from state array
        peerIds: peerIds.filter((id) => id !== uid),
      });
    });

    // If Local user joins RTC channel
    this._engine.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
      console.log('JoinChannelSuccess', channel, uid, elapsed);
      // Set state variable to true
      this.setState({
        joinSucceed: true,
      });
    });
  };

  /**
   * @name startCall
   * @description Function to start the call
   */
  startCall = async () => {
    // Join Channel using null token and channel name
    await this._engine?.joinChannel(
      this.state.token,
      this.state.channelName,
      null,
      0
    );
  };

  /**
   * @name endCall
   * @description Function to end the call
   */
  endCall = async () => {
    await this._engine?.leaveChannel();
    this.setState({ peerIds: [], joinSucceed: false });
  };

  /**
   * @name showStats
   * @description Function to toggle stats
   */
  showStats = async () => {
    this.setState({ showStats: !this.state.showStats });
  };

  render() {
    return (
      <View style={styles.max}>
        <View style={styles.max}>
          <View style={styles.buttonHolder}>
            <TouchableOpacity onPress={this.startCall} style={styles.button}>
              <Text style={styles.buttonText}> Start Call </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.endCall} style={styles.button}>
              <Text style={styles.buttonText}> End Call </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.showStats} style={styles.button}>
              <Text style={styles.buttonText}> Show Stats </Text>
            </TouchableOpacity>
          </View>
          {this._renderVideos()}
        </View>
      </View>
    );
  }

  _renderVideos = () => {
    const { joinSucceed } = this.state;
    return joinSucceed ? (
      <View style={styles.fullView}>
        <RtcLocalView.SurfaceView
          style={styles.max}
          channelId={this.state.channelName}
          renderMode={VideoRenderMode.Hidden}
        />
        {this._renderRemoteVideos()}
        {this._renderLocalStats()}
      </View>
    ) : null;
  };

  _renderLocalStats = () => {
    return this.state.showStats ? (
      <View style={styles.localStatContainer}>
        <View style={styles.flex1}>
          <Text style={styles.headingText}>Local Video Stats</Text>
          {this.state.localStats ? (
            <FlatList
              data={
                Object.keys(this.state.localStats) as [keyof LocalVideoStats]
              }
              renderItem={this._localStatItem}
              keyExtractor={(item) => item}
            />
          ) : null}
        </View>
        <View style={styles.flex1}>
          <Text style={styles.headingText}>RTC Stats</Text>
          {this.state.rtcStats ? (
            <FlatList
              data={Object.keys(this.state.rtcStats) as [keyof RtcStats]}
              renderItem={this._rtcStatItem}
              keyExtractor={(item) => item}
            />
          ) : null}
        </View>
      </View>
    ) : null;
  };

  _localStatItem = ({ item }: { item: keyof LocalVideoStats }) => {
    return (
      <Text>
        {item + ': ' + (this.state.localStats as LocalVideoStats)[item]}
      </Text>
    );
  };

  _rtcStatItem = ({ item }: { item: keyof RtcStats }) => {
    return <Text>{item + ': ' + (this.state.rtcStats as RtcStats)[item]}</Text>;
  };

  _renderRemoteVideos = () => {
    const { peerIds } = this.state;
    return (
      <ScrollView
        style={styles.remoteContainer}
        contentContainerStyle={styles.remoteScroll}
        horizontal={true}
      >
        {peerIds.map((value) => {
          return (
            <View key={value} style={styles.remote}>
              <RtcRemoteView.SurfaceView
                style={styles.remote}
                uid={value}
                channelId={this.state.channelName}
                renderMode={VideoRenderMode.Hidden}
                zOrderMediaOverlay={true}
              />
              {this._renderRemoteStats(value)}
            </View>
          );
        })}
      </ScrollView>
    );
  };

  _renderRemoteStats = (value: number) => {
    return this.state.showStats ? (
      <View style={styles.remoteStatsContainer}>
        {this.state.remoteStats[value] ? (
          <>
            <Text style={styles.headingText}>Remote Video Stats</Text>
            <FlatList
              data={Object.keys(this.state.remoteStats[value])}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                return (
                  <Text key={item}>
                    {item +
                      ': ' +
                      this.state.remoteStats[value][
                        item as keyof RemoteVideoStats
                      ]}
                  </Text>
                );
              }}
            />
          </>
        ) : null}
      </View>
    ) : null;
  };
}
