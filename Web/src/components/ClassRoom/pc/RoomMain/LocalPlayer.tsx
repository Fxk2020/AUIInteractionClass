import React, { useRef, useEffect, useMemo, CSSProperties } from 'react';
import { message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import useClassroomStore from '../../store';
import { loadJS } from '../../utils/common';
import livePush from '../../utils/LivePush';
import styles from './styles.less';

const LocalPlayerID = 'local-media-player';

interface IProps {
  rendererStyle?: CSSProperties;
}

const LocalPlayer: React.FC<IProps> = props => {
  const { rendererStyle } = props;
  const { sources } = useClassroomStore(state => state.localMedia);
  const { setLocalMeida, setLocalMeidaStream } = useClassroomStore.getState();
  const player = useRef<any>();
  const livePusher = useMemo(() => {
    return livePush.getInstance('alivc')!;
  }, []);

  const createPlayer = (sources: any[]) => {
    loadJS(`${PUBLIC_PATH}script/aliplayercomponents-1.0.5.min.js`).then(() => {
      const ins = new window.Aliplayer(
        {
          id: 'local-media-player',
          source: sources[0].source,
          width: '100%',
          height: '100%',
          autoplay: true,
          rePlay: true,
          isLive: false,
          keyShortCuts: true,
          skinLayout: [
            { name: 'bigPlayButton', align: 'cc' },
            { name: 'H5Loading', align: 'cc' },
            { name: 'errorDisplay', align: 'tlabs', x: 0, y: 100 },
            {
              name: 'controlBar',
              align: 'blabs',
              x: 0,
              y: 0,
              children: [
                { name: 'progress', align: 'blabs', x: 0, y: 44 },
                { name: 'playButton', align: 'tl', x: 15, y: 12 },
                { name: 'timeDisplay', align: 'tl', x: 10, y: 7 },
                { name: 'volume', align: 'tr', x: 5, y: 10 },
              ],
            },
          ],
          components:
            sources.length > 1
              ? [
                  {
                    name: 'PlaylistComponent',
                    type: (window as any).AliPlayerComponent.PlaylistComponent,
                    args: [sources],
                  },
                ]
              : undefined,
        },
        (_player: any) => {
          console.log('The player is created', _player);
        }
      );
      ins.on('canplay', () => {
        const videoDom: any = document.querySelector(`#${LocalPlayerID}>video`);
        if (videoDom && videoDom.captureStream) {
          const mediaStream: MediaStream = videoDom.captureStream();
          if (mediaStream.getVideoTracks().length) {
            setLocalMeidaStream(mediaStream);
          }
        }
      });
      ins.on('error', (err: any) => {
        console.log('player error', err);
        let msg = '播放失败，无法推本地音视频流';
        if (
          err &&
          err.paramData &&
          err.paramData.error_msg &&
          err.paramData.error_msg.includes('Format error')
        ) {
          msg = '播放失败，不支持该编码格式的音视频';
        }
        message.error(msg);
        setLocalMeidaStream(undefined);
      });
      ins.on('volumechange', () => {
        livePusher.setVolume({
          custom: ins.getVolume(),
        });
      });
      player.current = ins;
    });
  };

  useEffect(() => {
    if (!sources.length) {
      return;
    }

    createPlayer(sources);

    return () => {
      if (player.current) {
        player.current.dispose();
        player.current = null;
      }
      sources.forEach(item => {
        URL.revokeObjectURL(item.source);
      });
    };
  }, [sources]);

  const closeLocalPlayer = () => {
    setLocalMeida({
      sources: [],
    });
  };

  return (
    <div
      className={styles['local-player']}
      style={
        !sources.length
          ? {
              display: 'none',
            }
          : undefined
      }
    >
      <div className={styles['local-player__container']} style={rendererStyle}>
        <div className={styles['close-btn']} onClick={closeLocalPlayer}>
          <CloseOutlined />
        </div>
        <div id={LocalPlayerID}></div>
      </div>
    </div>
  );
};

export default LocalPlayer;