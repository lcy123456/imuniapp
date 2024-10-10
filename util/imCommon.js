import store from '@/store';
import { businessLogin } from '@/api/login';
import { AudioVideoType } from '@/enum';
import { AddFriendQrCodePrefix, AddGroupQrCodePrefix } from '@/constant';
import { getOnlineStateFromSvr } from '@/api/imApi';
import { businessSearchUserInfo } from '@/api/login';
import { AudioVideoStatus, UrlMap } from '@/enum';
import { checkLoginError } from '@/util/common';
import i18n from '@/locale/index';
import IMSDK, {
    IMMethods,
    GroupAtType,
    MessageType,
    SessionType
} from 'openim-uniapp-polyfill';
import emojis from '@/common/emojis';
import { getPurePath } from '@/util/common';
import { DecryptoAES } from '@/util/crypto';

import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import 'dayjs/locale/en';

dayjs.extend(calendar);
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.locale('en');

dayjs.updateLocale('en', {
    calendar: {
        sameElse: 'YYYY-MM-DD'
    }
});
dayjs.updateLocale('en', {
    calendar: {
        sameDay: `[${i18n.t('Today')}] HH:mm`, // The same day ( Today at 2:30 AM )
        nextDay: `[${i18n.t('Tomorrow')}] HH:mm`, // The next day ( Tomorrow at 2:30 AM )
        nextWeek: 'dddd HH:mm', // The next week ( Sunday at 2:30 AM )
        lastDay: `[${i18n.t('Yesterday')}] HH:mm`, // The day before ( Yesterday at 2:30 AM )
        lastWeek: 'YYYY-MM-DD', // Last week ( Last Monday at 2:30 AM )
        sameElse: 'YYYY-MM-DD' // Everything else ( 17/10/2011 )
    }
});

export const burnMenuList = [
    { id: 24 * 60 * 60, label: i18n.t('One_day'), text: '1D' },
    { id: 24 * 60 * 60 * 7, label: i18n.t('One_week'), text: '1W' },
    { id: 24 * 60 * 60 * 30, label: i18n.t('One_month'), text: '1M' },
    { id: 24 * 60 * 60 * 30 * 2, label: i18n.t('two_months'), text: '2M' },
    { id: 24 * 60 * 60 * 30 * 3, label: i18n.t('three_months'), text: '3M' },
    { id: 24 * 60 * 60 * 30 * 4, label: i18n.t('four_months'), text: '4M' },
    { id: 24 * 60 * 60 * 30 * 5, label: i18n.t('five_months'), text: '5M' },
    { id: 24 * 60 * 60 * 30 * 6, label: i18n.t('six_months'), text: '6M' },
    { id: 24 * 60 * 60 * 30 * 7, label: i18n.t('seven_months'), text: '7M' },
    { id: 24 * 60 * 60 * 30 * 8, label: i18n.t('eight_months'), text: '8M' },
    { id: 24 * 60 * 60 * 30 * 9, label: i18n.t('nine_months'), text: '9M' },
    { id: 24 * 60 * 60 * 30 * 10, label: i18n.t('ten_months'), text: '10M' },
    {
        id: 24 * 60 * 60 * 30 * 11,
        label: i18n.t('eleven_months'),
        text: '11M'
    },
    { id: 24 * 60 * 60 * 30 * 12, label: i18n.t('twelve_months'), text: '12M' }
];

const nomalTypes = [GroupAtType.AtAll, GroupAtType.AtAllAtMe, GroupAtType.AtMe];

export const conversationSort = conversationList => {
    const arr = [];
    const filterArr = conversationList.filter(
        c => !arr.includes(c.conversationID) && arr.push(c.conversationID)
    );
    filterArr.sort((a, b) => {
        if (a.isPinned === b.isPinned) {
            const aCompare =
                a.draftTextTime > a.latestMsgSendTime
                    ? a.draftTextTime
                    : a.latestMsgSendTime;
            const bCompare =
                b.draftTextTime > b.latestMsgSendTime
                    ? b.draftTextTime
                    : b.latestMsgSendTime;
            if (aCompare > bCompare) {
                return -1;
            } else if (aCompare < bCompare) {
                return 1;
            } else {
                return 0;
            }
        } else if (a.isPinned && !b.isPinned) {
            return -1;
        } else {
            return 1;
        }
    });
    return filterArr;
};

export const isEdit = message => {
    try {
        const ex = JSON.parse(message.ex);
        return ex.type === 'edit';
    } catch (err) {
        return false;
    }
};
export const isLike = message => {
    try {
        const ex = JSON.parse(message.ex);
        return ex.giveLike;
    } catch (err) {
        return false;
    }
};
export const isPin = message => {
    return message.pinMap;
};

export const parseAt = (atel, type) => {
    let mstr = atel.text;
    const pattern = /@\d+\s/g;
    const arr = mstr.match(pattern);
    const atUserList = atel.atUsersInfo ?? [];
    arr?.map(match => {
        const member = atUserList.find(
            user => user.atUserID === match.slice(1, -1)
        );
        if (member) {
            if (!type) {
                mstr = mstr.replace(
                    match,
                    `<text data-at="${member.atUserID}" class="at_member" style="color: #008dff;"> @${member.groupNickname}&nbsp;</text>`
                );
            } else {
                mstr = mstr.replace(match, `@${member.atUserID} `);
            }
        }
        // else {
        // 	mstr = mstr.replace(match, `<text class='parsed_at_el'> ${match}</text>`);
        // }
    });
    return mstr;
};

export const parseLink = text => {
    const pattern = /(https?:\/\/[^\s]+)/g;
    const arr = text.match(pattern);
    arr?.map(match => {
        text = text.replace(
            match,
            `<text data-url="${match}" class="link-css" style="color: #008dff;">${match}</text>`
        );
    });
    return text;
};

export const parseEmoji = msgStr => {
    emojis.map(item => {
        if (msgStr?.includes(item.context)) {
            let imgStr = `<img class="emoji_display" src="${item.src}"/>`;
            imgStr = imgStr.replace('/static', 'static');
            msgStr = msgStr.replace(item.reg, imgStr);
        }
    });
    return msgStr;
};

const switchCustomMsg = cMsg => {
    switch (cMsg.type) {
        case AudioVideoType.Video:
            return `[${i18n.t('Video_call')}]`;
        case AudioVideoType.Audio:
            return `[${i18n.t('Voice_call')}]`;
        default:
            return '';
    }
};

export const sec2Time = seconds => {
    let theTime1 = 0; // min
    let theTime2 = 0; // hour
    let theTime3 = 0; // day
    if (seconds > 60) {
        theTime1 = parseInt(seconds / 60);
        seconds = parseInt(seconds % 60);
        if (theTime1 > 60) {
            theTime2 = parseInt(theTime1 / 60);
            theTime1 = parseInt(theTime1 % 60);
            if (theTime2 > 24) {
                theTime3 = parseInt(theTime2 / 24);
                theTime2 = parseInt(theTime2 % 24);
            }
        }
    }
    let result = '';
    if (seconds > 0) {
        result = '' + parseInt(seconds) + i18n.t('Seconds');
    }
    if (theTime1 > 0) {
        result = '' + parseInt(theTime1) + i18n.t('Minutes') + result;
    }
    if (theTime2 > 0) {
        result = '' + parseInt(theTime2) + i18n.t('Hour') + result;
    }
    if (theTime3 > 0) {
        result = '' + parseInt(theTime3) + i18n.t('Day') + result;
    }
    return result;
};

export function getName(map) {
    const friendList = store.getters.storeFriendList;
    const item = friendList.find(
        friend => friend.userID === (map.sendID || map.userID)
    );
    return item ? item.remark || item.nickname : map.senderNickname;
}

export const parseMessageByType = (pmsg, isNotify = false) => {
    try {
        const isSelf = id => id === store.getters.storeCurrentUserID;
        const getName = user => {
            return user.userID === store.getters.storeCurrentUserID
                ? i18n.t('You')
                : user.nickname;
        };
        switch (pmsg.contentType) {
            case AudioVideoStatus.groupDone:
                try {
                    const groupVideoAudioDetail = JSON.parse(
                        pmsg.notificationElem.detail
                    );
                    return `${
                        groupVideoAudioDetail.type === AudioVideoType.Video
                            ? i18n.t('Video_call_ended')
                            : i18n.t('Voice_call_ended')
                    }`;
                } catch (err) {
                    return i18n.t('Call_ended');
                }
            case AudioVideoStatus.groupStart:
                try {
                    const groupVideoAudioDetail = JSON.parse(
                        pmsg.notificationElem.detail
                    );
                    const groupVideoAudioName = `${
                        pmsg.sendID === store.getters.storeCurrentUserID
                            ? i18n.t('You')
                            : pmsg.senderNickname
                    }`;
                    return `${groupVideoAudioName} ${
                        groupVideoAudioDetail.type === AudioVideoType.Video
                            ? i18n.t('[Initiate_video_call]').slice(1, -1)
                            : i18n.t('[Initiate_voice_call]').slice(1, -1)
                    }`;
                } catch (err) {
                    return i18n.t('Call_in_progress');
                }
            case MessageType.TextMessage:
                return DecryptoAES(pmsg.textElem.content);
            case 117:
                return DecryptoAES(pmsg.advancedTextElem.text);
            case MessageType.AtTextMessage:
                return parseAt(pmsg.atTextElem, 1);
            case MessageType.PictureMessage:
                return i18n.t('[Picture]');
            case MessageType.VideoMessage:
                return i18n.t('[Video]');
            case MessageType.VoiceMessage:
                return i18n.t('[Voice]');
            case MessageType.LocationMessage:
                return i18n.t('[Location]');
            case MessageType.CardMessage:
                return i18n.t('[Business_card]');
            case MessageType.MergeMessage:
                return i18n.t('[Merge_message]');
            case MessageType.FileMessage:
                return `${i18n.t('[File]')} ${pmsg.fileElem.fileName}`;
            case MessageType.RevokeMessage:
                try {
                    const data = JSON.parse(pmsg.notificationElem.detail);
                    const revoker = isSelf(data.revokerID)
                        ? i18n.t('You')
                        : data.revokerNickname;
                    const sourcer = isSelf(data.sourceMessageSendID)
                        ? i18n.t('You')
                        : data.sourceMessageSenderNickname;
                    const isAdminRevoke =
                        data.revokerID !== data.sourceMessageSendID;
                    if (isAdminRevoke) {
                        return `${revoker} ${i18n
                            .t('A_message_was_withdrawn_user')
                            .replace('{value}', sourcer)}`;
                    }
                    return `${revoker} ${i18n.t('[A_message_was_withdrawn]')}`;
                } catch (err) {
                    return i18n.t('[A_message_was_withdrawn]');
                }
            case MessageType.CustomMessage:
                try {
                    const customEl = pmsg.customElem;
                    const customData = JSON.parse(customEl.data);
                    if (customData.type) {
                        return switchCustomMsg(customData);
                    }
                    return i18n.t('[Custom_message]');
                } catch (err) {
                    return i18n.t('[Custom_message]');
                }
            case MessageType.QuoteMessage:
                return i18n.t('[Quote_message]');
            case MessageType.FaceMessage:
                return i18n.t('[Emoji]');
            case MessageType.FriendAdded:
                return i18n.t('You_are_already_friends_lets_start_chatting');
            case MessageType.MemberEnter:
                const enterDetails = JSON.parse(pmsg.notificationElem.detail);
                const enterUser = enterDetails.entrantUser;
                return `${getName(enterUser)} ${i18n.t(
                    'Entered_the_group_chat'
                )}`;
            case MessageType.GroupCreated:
                const groupCreatedDetail = JSON.parse(
                    pmsg.notificationElem.detail
                );
                const groupCreatedUser = groupCreatedDetail.opUser;
                return `${getName(groupCreatedUser)} ${i18n.t(
                    'Created_a_group_chat'
                )}`;
            case MessageType.MemberInvited:
                const inviteDetails = JSON.parse(pmsg.notificationElem.detail);
                const inviteOpUser = inviteDetails.opUser;
                const invitedUserList = inviteDetails.invitedUserList ?? [];
                let inviteStr = '';
                invitedUserList.find(
                    (user, idx) => (inviteStr += getName(user) + ' ') && idx > 3
                );
                return `${getName(inviteOpUser)} ${i18n
                    .t('Invited_{value}_to_the_group_chat')
                    .replace(
                        '{value}',
                        inviteStr + invitedUserList.length > 3 ? '...' : ''
                    )}`;

            case MessageType.MemberKicked:
                const kickDetails = JSON.parse(pmsg.notificationElem.detail);
                const kickOpUser = kickDetails.opUser;
                const kickdUserList = kickDetails.kickedUserList ?? [];
                let kickStr = '';
                kickdUserList.find(
                    (user, idx) => (kickStr += getName(user) + ' ') && idx > 3
                );
                return `${getName(kickOpUser)} ${i18n.t(
                    'Kicked_out'
                )} ${kickStr} ${kickdUserList.length > 3 ? '...' : ''}`;
            case MessageType.MemberQuit:
                const quitDetails = JSON.parse(pmsg.notificationElem.detail);
                const quitUser = quitDetails.quitUser;
                return `${getName(quitUser)} ${i18n.t(
                    'Exited_the_group_chat'
                )}`;
            case MessageType.GroupInfoUpdated:
                const groupUpdateDetail = JSON.parse(
                    pmsg.notificationElem.detail
                );
                const groupUpdateUser = groupUpdateDetail.opUser;
                let updateFiled = i18n.t('Group_settings');
                if (groupUpdateDetail.group.notification) {
                    updateFiled = i18n.t('Group_announcement');
                }
                if (groupUpdateDetail.group.groupName) {
                    updateFiled = `${i18n.t('Group_name_is')} ${
                        groupUpdateDetail.group.groupName
                    }`;
                }
                if (groupUpdateDetail.group.faceURL) {
                    updateFiled = i18n.t('Group_avatar');
                }
                if (groupUpdateDetail.group.introduction) {
                    updateFiled = i18n.t('Group_introduction');
                }
                return `${getName(groupUpdateUser)} ${i18n.t(
                    'Modified'
                )} ${updateFiled}`;
            case MessageType.GroupOwnerTransferred:
                const transferDetails = JSON.parse(
                    pmsg.notificationElem.detail
                );
                const transferOpUser = transferDetails.opUser;
                const newOwner = transferDetails.newGroupOwner;
                return `${getName(transferOpUser)} ${i18n.t(
                    'Transferred_group_owner_to'
                )} ${getName(newOwner)}`;
            case MessageType.GroupDismissed:
                const dismissDetails = JSON.parse(pmsg.notificationElem.detail);
                const dismissUser = dismissDetails.opUser;
                return `${getName(dismissUser)} ${i18n.t(
                    'Disbanded_the_group_chat'
                )}`;
            case MessageType.GroupMuted:
                const GROUPMUTEDDetails = JSON.parse(
                    pmsg.notificationElem.detail
                );
                const groupMuteOpUser = GROUPMUTEDDetails.opUser;
                return `${getName(groupMuteOpUser)} ${i18n.t(
                    'Enabled_all_mute'
                )}`;
            case MessageType.GroupCancelMuted:
                const GROUPCANCELMUTEDDetails = JSON.parse(
                    pmsg.notificationElem.detail
                );
                const groupCancelMuteOpUser = GROUPCANCELMUTEDDetails.opUser;
                return `${getName(groupCancelMuteOpUser)} ${i18n.t(
                    'Cancelled_all_mute'
                )}`;
            case MessageType.GroupMemberMuted:
                const gmMutedDetails = JSON.parse(pmsg.notificationElem.detail);
                // const muteTime = sec2Time(gmMutedDetails.mutedSeconds);
                // return `${getName(gmMutedDetails.opUser)} ${i18n.t(
                //     'Muted'
                // )} ${getName(gmMutedDetails.mutedUser)} ${muteTime}`;
                return `${getName(gmMutedDetails.mutedUser)} ${i18n.t(
                    'was_banned'
                )}`;

            case MessageType.GroupMemberCancelMuted:
                const gmcMutedDetails = JSON.parse(
                    pmsg.notificationElem.detail
                );
                return `${getName(gmcMutedDetails.mutedUser)} ${i18n.t(
                    'Unmute'
                )}`;
            case MessageType.GroupAnnouncementUpdated:
                const groupAnnouncementUpdateDetail = JSON.parse(
                    pmsg.notificationElem.detail
                );
                const groupAnnouncementUpdateUser =
                    groupAnnouncementUpdateDetail.opUser;
                return `${getName(groupAnnouncementUpdateUser)} ${i18n.t(
                    'Modified_group_announcement'
                )}`;
            case MessageType.GroupNameUpdated:
                const groupNameUpdateDetail = JSON.parse(
                    pmsg.notificationElem.detail
                );
                const groupNameUpdateUser = groupNameUpdateDetail.opUser;
                return `${getName(groupNameUpdateUser)} ${i18n.t(
                    'Modified_group_name_to'
                )} ${groupNameUpdateDetail.group.groupName}`;
            case MessageType.OANotification:
                const customNoti = JSON.parse(pmsg.notificationElem.detail);
                return customNoti.text;
            case MessageType.BurnMessageChange:
                const burnDetails = JSON.parse(pmsg.notificationElem.detail);
                const name = `${
                    burnDetails.revokerID === store.getters.storeCurrentUserID
                        ? i18n.t('You')
                        : burnDetails.revokerNickname
                }`;
                const timeText =
                    burnMenuList.find(v => v.id === burnDetails.revokeTime)
                        ?.label || '';
                return burnDetails.revokerRole
                    ? `${name} ${i18n
                          .t(
                              'Automatic_deletion_has_been_set__Message_sent_before'
                          )
                          .replace('{value}', timeText)}`
                    : `${name} ${i18n.t(
                          'Automatic_message_deletion_disabled'
                      )}`;
            default:
                return '';
        }
    } catch (err) {
        return '';
    }
};

export const formatConversionTime = timestemp => {
    const fromNowStr = dayjs(timestemp).fromNow();

    if (fromNowStr.includes(i18n.t('Seconds'))) {
        return i18n.t('Just_now');
    }

    if (
        !fromNowStr.includes(i18n.t('Seconds')) &&
        !fromNowStr.includes(i18n.t('Minutes'))
    ) {
        return dayjs(timestemp).calendar();
    }

    return fromNowStr;
};

export const secFormat = sec => {
    let h;
    let s;
    h = Math.floor(sec / 60);
    s = sec % 60;
    h += '';
    s += '';
    h = h.length === 1 ? '0' + h : h;
    s = s.length === 1 ? '0' + s : s;
    return h + ':' + s;
};

export const bytesToSize = bytes => {
    if (bytes === 0) return '0 B';
    let k = 1024,
        sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));

    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
};

export const tipMessaggeFormat = (msg, currentUserID) => {
    try {
        if (msg.contentType === MessageType.RevokeMessage) {
            let revoker, sourcer, isAdminRevoke;
            const data = JSON.parse(msg.notificationElem.detail);
            revoker =
                currentUserID === data.revokerID
                    ? i18n.t('You')
                    : data.revokerNickname;
            isAdminRevoke = data.revokerID !== data.sourceMessageSendID;
            sourcer =
                data.sourceMessageSendID === currentUserID
                    ? i18n.t('You')
                    : data.sourceMessageSenderNickname;

            if (isAdminRevoke) {
                return `${revoker} ${i18n
                    .t('A_message_was_withdrawn_user')
                    .replace('{value}', sourcer)}`;
            }
            return `${revoker} ${i18n.t('A_message_was_withdrawn')}`;
        }

        const getName = user => {
            return user.userID === currentUserID
                ? i18n.t('You')
                : user.nickname;
        };

        switch (msg.contentType) {
            case AudioVideoStatus.groupDone:
                try {
                    const groupVideoAudioDetail = JSON.parse(
                        msg.notificationElem.detail
                    );
                    return `${
                        groupVideoAudioDetail.type === AudioVideoType.Video
                            ? i18n.t('Video_call_ended')
                            : i18n.t('Voice_call_ended')
                    }`;
                } catch (err) {
                    return i18n.t('Call_ended');
                }
            case AudioVideoStatus.groupStart:
                try {
                    const groupVideoAudioDetail = JSON.parse(
                        msg.notificationElem.detail
                    );
                    const groupVideoAudioName = `${
                        msg.sendID === store.getters.storeCurrentUserID
                            ? i18n.t('You')
                            : msg.senderNickname
                    }`;
                    return `${groupVideoAudioName} ${
                        groupVideoAudioDetail.type === AudioVideoType.Video
                            ? i18n.t('Initiate_video_call').slice(1, -1)
                            : i18n.t('Initiate_voice_call').slice(1, -1)
                    }`;
                } catch (err) {
                    return i18n.t('Call_in_progress');
                }
            case MessageType.FriendAdded:
                return i18n.t('You_are_already_friends_lets_start_chatting');
            case MessageType.GroupCreated:
                const groupCreatedDetail = JSON.parse(
                    msg.notificationElem.detail
                );
                const groupCreatedUser = groupCreatedDetail.opUser;
                return `${getName(groupCreatedUser)} ${i18n.t(
                    'Created_a_group_chat'
                )}`;
            case MessageType.GroupInfoUpdated:
                const groupUpdateDetail = JSON.parse(
                    msg.notificationElem.detail
                );
                const groupUpdateUser = groupUpdateDetail.opUser;
                let updateFiled = i18n.t('Group_settings');
                if (groupUpdateDetail.group.notification) {
                    updateFiled = i18n.t('Group_announcement');
                }
                if (groupUpdateDetail.group.groupName) {
                    updateFiled = `${i18n.t('Group_name_is')} ${
                        groupUpdateDetail.group.groupName
                    }`;
                }
                if (groupUpdateDetail.group.faceURL) {
                    updateFiled = i18n.t('Group_avatar');
                }
                if (groupUpdateDetail.group.introduction) {
                    updateFiled = i18n.t('Group_introduction');
                }
                return `${getName(groupUpdateUser)} ${i18n.t(
                    'Modified'
                )} ${updateFiled}`;
            case MessageType.GroupOwnerTransferred:
                const transferDetails = JSON.parse(msg.notificationElem.detail);
                const transferOpUser = transferDetails.opUser;
                const newOwner = transferDetails.newGroupOwner;
                return `${getName(transferOpUser)} ${i18n.t(
                    'Transferred_group_owner_to'
                )} ${getName(newOwner)}`;
            case MessageType.MemberQuit:
                const quitDetails = JSON.parse(msg.notificationElem.detail);
                const quitUser = quitDetails.quitUser;
                return `${getName(quitUser)} ${i18n.t(
                    'Exited_the_group_chat'
                )}`;
            case MessageType.MemberInvited:
                const inviteDetails = JSON.parse(msg.notificationElem.detail);
                const inviteOpUser = inviteDetails.opUser;
                const invitedUserList = inviteDetails.invitedUserList ?? [];
                let inviteStr = '';
                invitedUserList.find(
                    (user, idx) => (inviteStr += getName(user) + ' ') && idx > 3
                );
                return `${getName(inviteOpUser)} ${i18n
                    .t('Invited_{value}_to_the_group_chat')
                    .replace(
                        '{value}',
                        inviteStr + invitedUserList.length > 3 ? '...' : ''
                    )}`;
            case MessageType.MemberKicked:
                const kickDetails = JSON.parse(msg.notificationElem.detail);
                const kickOpUser = kickDetails.opUser;
                const kickdUserList = kickDetails.kickedUserList ?? [];
                let kickStr = '';
                kickdUserList.find(
                    (user, idx) => (kickStr += getName(user) + ' ') && idx > 3
                );
                return `${getName(kickOpUser)} ${i18n.t(
                    'Kicked_out'
                )} ${kickStr} ${kickdUserList.length > 3 ? '...' : ''}`;
            case MessageType.MemberEnter:
                const enterDetails = JSON.parse(msg.notificationElem.detail);
                const enterUser = enterDetails.entrantUser;
                return `${getName(enterUser)} ${i18n.t(
                    'Entered_the_group_chat'
                )}`;
            case MessageType.GroupDismissed:
                const dismissDetails = JSON.parse(msg.notificationElem.detail);
                const dismissUser = dismissDetails.opUser;
                return `${getName(dismissUser)} ${i18n.t(
                    'Disbanded_the_group_chat'
                )}`;
            case MessageType.GroupMuted:
                const groupMutedDetails = JSON.parse(
                    msg.notificationElem.detail
                );
                const groupMuteOpUser = groupMutedDetails.opUser;
                return `${getName(groupMuteOpUser)} ${i18n.t(
                    'Enabled_all_mute'
                )}`;
            case MessageType.GroupCancelMuted:
                const groupCancelMutedDetails = JSON.parse(
                    msg.notificationElem.detail
                );
                const groupCancelMuteOpUser = groupCancelMutedDetails.opUser;
                return `${getName(groupCancelMuteOpUser)} ${i18n.t(
                    'Cancelled_all_mute'
                )}`;
            case MessageType.GroupMemberMuted:
                const gmMutedDetails = JSON.parse(msg.notificationElem.detail);
                // const muteTime = sec2Time(gmMutedDetails.mutedSeconds);
                return `${getName(gmMutedDetails.mutedUser)} ${i18n.t(
                    'was_banned'
                )}`;
            case MessageType.GroupMemberCancelMuted:
                const gmcMutedDetails = JSON.parse(msg.notificationElem.detail);
                return `${getName(gmcMutedDetails.mutedUser)} ${i18n.t(
                    'Unmute'
                )}`;
            case MessageType.GroupNameUpdated:
                const groupNameUpdateDetail = JSON.parse(
                    msg.notificationElem.detail
                );
                const groupNameUpdateUser = groupNameUpdateDetail.opUser;
                return `${getName(groupNameUpdateUser)} ${i18n.t(
                    'Modified_group_name_to'
                )} ${groupNameUpdateDetail.group.groupName}`;
            case MessageType.BurnMessageChange:
                const burnDetails = JSON.parse(msg.notificationElem.detail);
                const name = `${
                    burnDetails.revokerID === store.getters.storeCurrentUserID
                        ? i18n.t('You')
                        : burnDetails.revokerNickname
                }`;
                const timeText =
                    burnMenuList.find(v => v.id === burnDetails.revokeTime)
                        ?.label || '';
                return burnDetails.revokerRole
                    ? `${name} ${i18n
                          .t(
                              'Automatic_deletion_has_been_set__Message_sent_before'
                          )
                          .replace('{value}', timeText)}`
                    : `${name} ${i18n.t(
                          'Automatic_message_deletion_disabled'
                      )}`;
            case MessageType.OANotification:
                const customNoti = JSON.parse(msg.notificationElem.detail);
                return customNoti.text;
            default:
                return '';
        }
    } catch (err) {
        return '';
    }
};

export const IMLogin = async isLogin => {
    // console.log('-----', store.state.user.authData);
    const { storeUserID, storeIMToken } = store.getters;
    if (!storeUserID || !storeIMToken) {
        store.commit('user/SET_AUTH_DATA', {});
        uni.reLaunch({
            url: '/pages/login/index'
        });
        throw new Error(i18n.t('User_does_not_exist'));
    }
    try {
        const status = await IMSDK.asyncApi(
            IMSDK.IMMethods.GetLoginStatus,
            IMSDK.uuid()
        );
        console.log('status----status', status);
        if (isLogin) {
            if ([2, 3].includes(status)) {
                await IMSDK.asyncApi(IMSDK.IMMethods.Logout, IMSDK.uuid());
            }
            await IMSDK.asyncApi(IMMethods.Login, IMSDK.uuid(), {
                userID: storeUserID,
                token: storeIMToken
            });
        } else {
            if (![2, 3].includes(status)) {
                await IMSDK.asyncApi(IMMethods.Login, IMSDK.uuid(), {
                    userID: storeUserID,
                    token: storeIMToken
                });
            }
        }
        store.commit('user/SET_LOGIN_STATUS', true);
        store.dispatch('user/getSelfInfo');
        store.dispatch('conversation/getConversationList');
        store.dispatch('conversation/getUnReadCount');
        store.dispatch('contact/getFriendList');
        store.dispatch('contact/getGrouplist');
        store.dispatch('contact/getBlacklist');
        store.dispatch('contact/getRecvFriendApplications');
        store.dispatch('contact/getSentFriendApplications');
        store.dispatch('contact/getRecvGroupApplications');
        store.dispatch('contact/getSentGroupApplications');
        uni.switchTab({
            url: '/pages/conversation/conversationList/index'
        });
    } catch (err) {
        console.log('IMLogin----IMLogin', err);
        IMSDK.asyncApi(IMSDK.IMMethods.Logout, IMSDK.uuid());
        uni.$u.toast(i18n.t('OpenIM_login_exception_please_restart'));
        throw new Error(i18n.t('OpenIM_login_exception_please_restart'));
    }
};

export const login = async requestMap => {
    try {
        const data = await businessLogin(requestMap);
        // console.log('login------', data);
        store.commit('user/SET_AUTH_DATA', data);
        store.commit('user/SET_USER_LIST', {
            ...data,
            ...requestMap
        });
        return await IMLogin('login');
    } catch (err) {
        console.log(err, err.errMsg);
        uni.$u.toast(checkLoginError(err));
        return null;
    }
};

export const getDesignatedUserOnlineState = userID => {
    return new Promise(async (resolve, reject) => {
        let statusObj = {};
        try {
            const data = await getOnlineStateFromSvr(userID);
            statusObj = data[0];
        } catch (e) {
            reject(e);
        }
        const onlineStr = switchOnline(
            statusObj.status,
            statusObj.detailPlatformStatus
        );
        console.log('statusObj---statusObj', statusObj);
        console.log('onlineStr---onlineStr', onlineStr);
        resolve({
            onlineStr,
            status: statusObj.status
        });
    });
};

function switchOnline(oType, details) {
    switch (oType) {
        case 'offline':
            return i18n.t('Offline');
        case 'online':
            // let str = '';
            // details?.map(detail => {
            //     if (detail.status === 'online') {
            //         str += `${detail.platform}/`;
            //     }
            // });
            return `${i18n.t('Online')}`;
        // return `${str.slice(0, -1)} ${i18n.t('Online')}`;
        default:
            return oType;
    }
}

export const markConversationAsRead = (conversation, fromChating = false) => {
    if (conversation.unreadCount !== 0) {
        IMSDK.asyncApi(
            IMSDK.IMMethods.MarkConversationMessageAsRead,
            IMSDK.uuid(),
            conversation.conversationID
        );
    }
    const isNomalAtType = nomalTypes.includes(conversation.groupAtType);
    if (
        (isNomalAtType && !fromChating) ||
        (fromChating && conversation.groupAtType === GroupAtType.AtGroupNotice)
    ) {
        IMSDK.asyncApi(
            IMSDK.IMMethods.ResetConversationGroupAtType,
            IMSDK.uuid(),
            conversation.conversationID
        );
    }
};

export const prepareConversationState = (
    conversation,
    back2Tab = false,
    clientMsgID = '',
    seq = ''
) => {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const page = currentPage.route;
    if (
        ![
            `pages/conversation/conversationList/index`,
            `pages/conversation/conversationList/conversationArchive`
        ].includes(page)
    ) {
        uni.switchTab({
            url: '/pages/conversation/conversationList/index'
        });
    }
    markConversationAsRead(conversation);

    if (conversation.conversationType === SessionType.WorkingGroup) {
        store.dispatch('conversation/getCurrentGroup', conversation.groupID);
        store.dispatch(
            'conversation/getCurrentMemberInGroup',
            conversation.groupID
        );
    }
    store.dispatch('message/resetMessageState');
    store.commit('conversation/SET_CURRENT_CONVERSATION', conversation);

    let url = `/pages/conversation/chating/index?back2Tab=${back2Tab}&clientMsgID=${clientMsgID}&seq=${seq}`;
    if (conversation.conversationType === SessionType.Notification) {
        url = '/pages/conversation/notifyMessageList/index';
    }
    uni.navigateTo({
        url
    });
};

export const navigateToDesignatedConversation = (
    sourceID,
    sessionType,
    back2Tab = false
) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { data } = await IMSDK.asyncApi(
                IMSDK.IMMethods.GetOneConversation,
                IMSDK.uuid(),
                {
                    sessionType,
                    sourceID
                }
            );
            prepareConversationState(data, back2Tab);
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

export const recordToDesignatedConversation = (
    conversationID,
    back2Tab = false,
    clientMsgID = '',
    seq = ''
) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { data } = await IMSDK.asyncApi(
                IMSDK.IMMethods.GetMultipleConversation,
                IMSDK.uuid(),
                [conversationID]
            );
            prepareConversationState(data[0], back2Tab, clientMsgID, seq);
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

export const scanQrCodeResult = async result => {
    if (result?.includes(AddFriendQrCodePrefix)) {
        const userID = result.replace(AddFriendQrCodePrefix, '');
        uni.navigateTo({
            url: `/pages/common/userCard/index?sourceID=${userID}&isScan=true`
        });
    } else if (result?.includes(AddGroupQrCodePrefix)) {
        const groupID = result.replace(AddGroupQrCodePrefix, '');
        uni.navigateTo({
            url: `/pages/common/groupCard/index?sourceID=${groupID}&isScan=true`
        });
    } else {
        try {
            const resultMap = JSON.parse(result);
            const { value, type } = resultMap;
            if (type === 'login') {
                uni.navigateTo({
                    url: `/pages/login/scanLogin/index?code=${value}`
                });
            } else {
                uni.$u.toast(i18n.t('No_valid_content_was_identified'));
            }
        } catch (err) {
            console.log(err);
            uni.$u.toast(i18n.t('No_valid_content_was_identified'));
        }
        // uni.$u.toast(i18n.t('No_valid_content_was_identified'));
    }
};

export const offlinePushInfo = {
    title: 'you have a new message',
    desc: 'you have a new message',
    ex: '',
    iOSPushSound: '',
    iOSBadgeCount: true
};

export const getSourceUserInfo = sourceID => {
    return new Promise(async (resolve, reject) => {
        try {
            let info = null;
            const { total, users } = await businessSearchUserInfo(sourceID);
            if (total > 0) {
                const { data } = await IMSDK.asyncApi(
                    IMSDK.IMMethods.GetUsersInfo,
                    IMSDK.uuid(),
                    [sourceID]
                );
                const imData = data[0]?.friendInfo ?? data[0]?.publicInfo ?? {};
                info = {
                    ...imData,
                    ...users[0]
                };
            }
            resolve({
                ...info
            });
        } catch (e) {
            uni.$u.toast(i18n.t('Failed_to_obtain_user_information'));
            reject(e);
        }
    });
};

export const getUserListInfo = userList => {
    return new Promise(async (resolve, reject) => {
        try {
            const { data } = await IMSDK.asyncApi(
                IMSDK.IMMethods.GetUsersInfo,
                IMSDK.uuid(),
                userList
            );
            resolve([...data]);
        } catch (e) {
            uni.$u.toast(i18n.t('Failed_to_obtain_user_information'));
            reject(e);
        }
    });
};

export const uploadFile = async (path, contentType = 'image') => {
    const nameIdx = path.lastIndexOf('/') + 1;
    const typeIdx = path.lastIndexOf('.') + 1;
    const fileName = path.slice(nameIdx);
    const fileType = path.slice(typeIdx);
    const {
        data: { url }
    } = await IMSDK.asyncApi(IMSDK.IMMethods.UploadFile, IMSDK.uuid(), {
        filepath: getPurePath(path),
        name: fileName,
        contentType: `${contentType}/${fileType}`,
        uuid: IMSDK.uuid()
    });
    return url;
};

export const idsGetConversationID = message => {
    const { sessionType, sendID, recvID, groupID } = message;
    const min = Math.min(sendID, recvID);
    const max = Math.max(sendID, recvID);
    switch (sessionType) {
        case SessionType.Single:
            if (sendID && recvID) {
                return `si_${min}_${max}`;
            }
            return new Error('单聊缺少sendID或recvID，无法组成conversationID');
        case SessionType.WorkingGroup:
            if (groupID) {
                return `sg_${groupID}`;
            }
            return new Error('工作群缺少groupID，无法组成conversationID');
    }
};

export const getMessageContent = message => {
    let text = '';
    const { contentType, quoteElem, atTextElem, textElem } = message;
    // TODO：解密文本
    if (contentType === MessageType.QuoteMessage) {
        text = parseEmojiInsertImg(DecryptoAES(quoteElem?.text));
    } else if (contentType === MessageType.AtTextMessage) {
        text = parseEmojiInsertImg(parseAt(atTextElem, 1));
    } else {
        text = parseEmojiInsertImg(DecryptoAES(textElem?.content));
    }
    text = text.replace(/\n/g, '<br>');
    return text;
};

export const parseEmojiInsertImg = msgStr => {
    emojis.map(item => {
        if (msgStr?.includes(item.context)) {
            let imgStr = `<img width="24px" height="18px" class="emoji_el" data-custom="emojiText=${item.context}" src="${item.src}" />`;
            // imgStr = imgStr.replace("/static", "static");
            msgStr = msgStr.replace(item.reg, imgStr);
        }
    });
    return msgStr;
};

export const parseAtInsertImg = atel => {
    let mstr = atel.text;
    const pattern = /@\d+\s/g;
    const arr = mstr.match(pattern);
    const atUserList = atel.atUsersInfo ?? [];
    arr?.map(match => {
        const member = atUserList.find(
            user =>
                user.data.sendID === match.slice(1, -1) ||
                user.data.sendID.includes(',')
        );
        if (member) {
            let imgStr = `<img width="${member.width}" height="${member.height}" class="${member.extClass}" data-custom="sendID=${member.data.sendID}&amp;senderNickname=${member.data.senderNickname}" src="${member.src}" />`;
            // imgStr = imgStr.replace("/static", "static");
            mstr = mstr.replace(match, imgStr);
        }
    });
    return mstr;
};

export const formatFileUrl = url => {
    if (
        !url ||
        /blob|base64/.test(url) ||
        /^(http(s?)|\/storage|\/var|\/static)/.test(url)
    )
        return url;
    // const { storeThirdData } = store.getters;
    // return storeThirdData?.oss?.url + url;
    return UrlMap.base + url.replace('/openim/openim', '/openim');
};
