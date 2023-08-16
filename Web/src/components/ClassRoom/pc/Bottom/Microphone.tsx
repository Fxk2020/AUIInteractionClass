import { useEffect, useState, useMemo } from 'react';
import { Dropdown, message } from 'antd';
import classNames from 'classnames';
import livePush from '../../utils/LivePush';
import { uniqueDevice } from '../../utils/common';
import useClassroomStore from '../../store';
import {
  LeftOutlineSvg,
  MicCloseSvg,
  MicDisableSvg,
  MicLoadingSvg,
  MicNormalSvg,
} from '../../components/icons';
import styles from './index.less';

interface IProps {
  disabled: boolean;
}

export default function Mic({ disabled }: IProps) {
  const livePusher = useMemo(() => {
    return livePush.getInstance('alivc')!;
  }, []);
  const [showList, setShowList] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [deviceList, setDeviceList] = useState<MediaDeviceInfo[]>([]);

  const { setMicrophoneDeviceCount, setMicrophoneDevice, setMicrophoneEnable } =
    useClassroomStore.getState();
  const microphoneState = useClassroomStore(state => state.microphone);

  useEffect(() => {
    const updateMicList = () => {
      if (disabled) {
        setMicrophoneDeviceCount(0);
        return;
      }

      livePusher
        .getMicrophones()
        .then((micList: any[]) => {
          const filteredMicList = uniqueDevice(micList);
          setMicrophoneDeviceCount(filteredMicList.length);
          if (filteredMicList.length === 0) {
            message.error('未发现麦克风，请检查设备状况');
            return;
          }
          setDeviceList(filteredMicList);

          const currentDeviceId =
            useClassroomStore.getState().microphone.deviceId;

          // 当前选中不存在与列表（为初始化或被移除），默认选中第一个
          if (!filteredMicList.find(mic => mic.deviceId === currentDeviceId)) {
            setMicrophoneDevice(filteredMicList[0].deviceId);
          }

          // 未初始化
          if (!currentDeviceId) {
            setMicrophoneEnable(true, true);
          }
        })
        .catch(() => {
          // 没有权限
        });
    };

    updateMicList();
    navigator.mediaDevices.addEventListener('devicechange', updateMicList);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', updateMicList);
    };
  }, [disabled]);

  useEffect(() => {
    setSwitching(false);
  }, [microphoneState.trackId]);

  const toggleMic = () => {
    setSwitching(true);
    setMicrophoneEnable(!microphoneState.enable);
  };

  const changeDevice = (deviceId: string) => {
    setShowList(false);
    setMicrophoneDevice(deviceId);
  };

  const renderIcon = () => {
    if (switching || disabled || deviceList.length === 0) {
      return (
        <div className={classNames(styles.button, styles.disabled)}>
          {switching ? <MicLoadingSvg /> : <MicDisableSvg />}
          <div className={styles['button-text']}>麦克风</div>
        </div>
      );
    }
    return (
      <div className={styles.button} onClick={toggleMic}>
        {microphoneState.enable ? <MicNormalSvg /> : <MicCloseSvg />}
        <div className={styles['button-text']}>
          {microphoneState.enable ? '' : '取消'}静音
        </div>
      </div>
    );
  };

  return (
    <div className={styles['button-wrapper']}>
      {renderIcon()}
      {!disabled && deviceList.length > 1 && (
        <Dropdown
          overlayStyle={{ width: '220px' }}
          menu={{
            selectable: true,
            selectedKeys: microphoneState.deviceId
              ? [microphoneState.deviceId]
              : [],
            onSelect: e => changeDevice(e.key),
            items: [
              {
                key: 'grp',
                label: '选择麦克风',
                type: 'group',
                children: deviceList.map(item => ({
                  key: item.deviceId,
                  label: item.label,
                })),
              },
            ],
          }}
          trigger={['click']}
          placement="top"
          onOpenChange={o => setShowList(o)}
        >
          <div
            className={classNames(styles['arrow-button'], {
              [styles.highlight]: showList,
            })}
            onClick={() => setShowList(s => !s)}
          >
            <LeftOutlineSvg />
          </div>
        </Dropdown>
      )}
    </div>
  );
}
