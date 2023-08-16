export enum InteractionMessageTypes {
  PaaSLikeInfo = 1001, // 点赞数据
  PaaSUserJoin = 1002, // 用户进入消息组
  PaaSUserLeave = 1003, // 用户离开消息组
  PaaSMuteGroup = 1004, // 禁言消息组
  PaaSCancelMuteGroup = 1005, // 取消禁言消息组
  PaaSMuteUser = 1006, // 禁言消息组某个用户
  PaaSCancelMuteUser = 1007, // 取消禁言消息组某个用户
}

export enum InteractionEventNames {
  Message = 'message',
}

interface BasicMap<U> {
  [index: string]: U;
}

export interface IMessageOptions {
  groupId: string;
  type: number;
  skipAudit?: boolean;
  skipMuteCheck?: boolean;
  data?: BasicMap<any>;
}

export interface IMuteGroupReqModel {
  groupId?: string; //
  broadCastType?: number; // 系统消息扩散类型，0： 不扩散；1：扩散到指定人; 2:扩散到群组
}

export interface IGetMuteInfoReqModel {
  groupId: string; //
  userId: string;
}

export interface IGetMuteInfoRspModel {
  selfMuted: boolean;
  groupMuted: boolean;
}

export interface IListMessageReqModel {
  groupId: string; // 话题id, 聊天插件实例id
  sortType?: number; // 排序方式,0-时间递增顺序，1-时间递减顺序
  type: number; // 消息类型
  pageNum?: number; // 分页拉取的索引下标,第一次调用传1，后续调用+1
  pageSize?: number; // 分页拉取的大小，默认50条，最大200条
}

export interface IListMessageRspModel {
  messageList?: Array<IMessageModel>; // 返回的消息组的在线成员列表
  hasMore?: boolean; // 是否还剩数据
}
export interface IMessageModel {
  groupId?: string; // 话题id,聊天插件实例id
  messageId?: string; // 消息id
  type?: number; // 消息类型。系统消息小于10000
  senderId?: string; // 发送者id
  data?: string; // 消息内容，为xxDataModel转为字符串而来
  level?: number; // 消息分级：0-普通；1-低优先级； 2-高优先级
  userInfo?: IUserModel; // 发送者信息
}

export interface IUserModel {
  userId?: string; // 用户id
  userNick?: string; // 用户昵称
  userAvatar?: string; // 用户头像
  userExtension?: string; // 用户扩展信息
}