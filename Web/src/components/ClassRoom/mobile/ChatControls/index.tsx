import React, {
  useContext,
  useRef,
  useMemo,
  useState,
  KeyboardEvent,
} from 'react';
import classNames from 'classnames';
import useClassroomStore from '../../store';
import { ClassContext } from '../../ClassContext';
import { CustomMessageTypes } from '../../types';
import logger from '../../utils/Logger';
import styles from './index.less';

interface IChatControlsProps {
  theme?: 'dark' | 'light';
  className?: string;
  heartIconActive?: boolean;
  allowChat: boolean;
}

const ChatControls: React.FC<IChatControlsProps> = props => {
  const { allowChat, className, theme = 'dark' } = props;
  const operationRef = useRef<HTMLDivElement>(null);
  const { auiMessage } = useContext(ClassContext);
  const { commentInput, groupMuted, selfMuted, joinedGroupId } =
    useClassroomStore(state => state);
  const [sending, setSending] = useState<boolean>(false);

  const commentPlaceholder = useMemo(() => {
    let text = '说点什么吧';
    if (groupMuted) {
      text = '全员禁言中';
    } else if (selfMuted) {
      text = '您已被禁言';
    }
    return text;
  }, [groupMuted, selfMuted]);

  const updateCommentInput = (text: string) => {
    const { setCommentInput } = useClassroomStore.getState();
    setCommentInput(text);
  };

  const handleKeydown = (e: KeyboardEvent<HTMLInputElement>) => {
    const text = commentInput.trim();
    if (e.key !== 'Enter' || !text || sending || !allowChat) {
      return;
    }
    e.preventDefault();

    setSending(true);
    auiMessage
      .sendMessageToGroup({
        groupId: joinedGroupId,
        type: CustomMessageTypes.Comment,
        skipAudit: true,
        data: { content: text },
      })
      .then(() => {
        console.log('发送成功');
        updateCommentInput('');
      })
      .catch((err: any) => {
        console.log('发送失败', err);
        logger.sendMessageError(err);
      })
      .finally(() => {
        setSending(false);
      });
  };

  const touchInputHandler = () => {
    // 解决发送双击问题，增加scrollIntoView
    operationRef.current?.scrollIntoView(false);
  };

  return (
    <div
      className={classNames(styles['chat-controls'], className, {
        [styles['chat-controls-light']]: theme === 'light',
      })}
      ref={operationRef}
    >
      <form
        action=""
        className="chat-input-form"
        style={{ visibility: allowChat ? 'visible' : 'hidden' }}
        onSubmit={(e: any) => e.preventDefault()}
      >
        <input
          type="text"
          enterKeyHint="send"
          className="chat-input"
          placeholder={commentPlaceholder}
          value={commentInput}
          disabled={!allowChat || sending || groupMuted || selfMuted}
          onKeyDown={handleKeydown}
          onChange={e => updateCommentInput(e.target.value)}
          onTouchStart={touchInputHandler}
        />
      </form>
    </div>
  );
};

export default ChatControls;
