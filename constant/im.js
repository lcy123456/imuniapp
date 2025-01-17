import { MessageType } from 'openim-uniapp-polyfill';
import { AudioVideoStatus } from '@/enum';

export const CryptoKey = 'e314af8638ce3473';

export const CustomType = {
    VideoCall: 'c100',
    VoiceCall: 'c101',
    Call: 901,
    MassMsg: 903
};

export const SendMessageFailedType = {
    Unknown: 302,
    Blacked: 600,
    NotFriend: 601
};

export const noticeMessageTypes = [
    MessageType.RevokeMessage,
    MessageType.FriendAdded,
    MessageType.GroupCreated,
    MessageType.GroupInfoUpdated,
    MessageType.MemberQuit,
    MessageType.GroupOwnerTransferred,
    MessageType.MemberKicked,
    MessageType.MemberInvited,
    MessageType.MemberEnter,
    MessageType.GroupDismissed,
    MessageType.GroupMemberMuted,
    MessageType.GroupMuted,
    MessageType.GroupCancelMuted,
    MessageType.GroupMemberCancelMuted,
    MessageType.GroupNameUpdated,
    MessageType.BurnMessageChange,
    AudioVideoStatus.groupDone,
    AudioVideoStatus.groupStart
];

export const TextRenderTypes = [
    MessageType.TextMessage,
    MessageType.AtTextMessage,
    MessageType.QuoteMessage,
    117
];

export const MediaRenderTypes = [
    MessageType.VideoMessage,
    MessageType.PictureMessage
];
export const FileRenderTypes = [MessageType.FileMessage];
export const MergeRenderTypes = [MessageType.MergeMessage];
export const AudioVideoRenderTypes = [MessageType.CustomMessage];
