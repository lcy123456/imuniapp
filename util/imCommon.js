import store from "@/store";
import {
    CustomType,
    AddFriendQrCodePrefix,
    AddGroupQrCodePrefix,
} from "@/constant";
import { getOnlineStateFromSvr } from "@/api/imApi";
import { businessSearchUserInfo } from '@/api/login';
import IMSDK, {
    GroupAtType,
    MessageType,
    SessionType,
} from "openim-uniapp-polyfill";
import emojis from "../common/emojis";
import { getPurePath } from '@/util/common';
import { DecryptoAES } from '@/util/crypto';

import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
import "dayjs/locale/zh-cn";

dayjs.extend(calendar);
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.locale("zh-cn");

dayjs.updateLocale("en", {
    calendar: {
        sameElse: "YYYY-MM-DD",
    },
});
dayjs.updateLocale("zh-cn", {
    calendar: {
        sameDay: "[今天] HH:mm", // The same day ( Today at 2:30 AM )
        nextDay: "[明天] HH:mm", // The next day ( Tomorrow at 2:30 AM )
        nextWeek: "dddd HH:mm", // The next week ( Sunday at 2:30 AM )
        lastDay: "[昨天] HH:mm", // The day before ( Yesterday at 2:30 AM )
        lastWeek: "YYYY-MM-DD", // Last week ( Last Monday at 2:30 AM )
        sameElse: "YYYY-MM-DD", // Everything else ( 17/10/2011 )
    },
});

const nomalTypes = [GroupAtType.AtAll, GroupAtType.AtAllAtMe, GroupAtType.AtMe];

export const conversationSort = (conversationList) => {
    const arr = [];
    const filterArr = conversationList.filter(
        (c) => !arr.includes(c.conversationID) && arr.push(c.conversationID)
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

export const parseAt = (atel) => {
    let mstr = atel.text;
    const pattern = /@\S+\s/g;
    const arr = mstr.match(pattern);
    const atUserList = atel.atUsersInfo ?? [];
    arr?.map((match) => {
        const member = atUserList.find(
            (user) => user.atUserID === match.slice(1, -1)
        );
        if (member) {
            // mstr = mstr.replace(match, `<text class='parsed_at_el'> @${member.groupNickname}&nbsp;</text>`);
            mstr = mstr.replace(match, `@${member.groupNickname} `);
        }
    // else {
    // 	mstr = mstr.replace(match, `<text class='parsed_at_el'> ${match}</text>`);
    // }
    });
    return mstr;
};

export const parseEmoji = (msgStr) => {
    emojis.map((item) => {
        if (msgStr?.includes(item.context)) {
            let imgStr = `
			<img class="emoji_display" src="${item.src}"/>
			`;
            imgStr = imgStr.replace("/static", "static");
            msgStr = msgStr.replace(item.reg, imgStr);
        }
    });
    return msgStr;
};

const switchCustomMsg = (cMsg) => {
    switch (cMsg.customType) {
    case CustomType.MassMsg:
        return "[通知]";
    case CustomType.Call:
        return "[通话消息]";
    case CustomType.MeetingInvitation:
        return "[会议邀请]";
    default:
        return "";
    }
};

export const sec2Time = (seconds) => {
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
    let result = "";
    if (seconds > 0) {
        result = "" + parseInt(seconds) + "秒";
    }
    if (theTime1 > 0) {
        result = "" + parseInt(theTime1) + "分钟" + result;
    }
    if (theTime2 > 0) {
        result = "" + parseInt(theTime2) + "小时" + result;
    }
    if (theTime3 > 0) {
        result = "" + parseInt(theTime3) + "天" + result;
    }
    return result;
};

export const parseMessageByType = (pmsg, isNotify = false) => {
    const isSelf = (id) => id === store.getters.storeCurrentUserID;
    const getName = (user) => {
        return user.userID === store.getters.storeCurrentUserID
            ? "你"
            : user.nickname;
    };
    switch (pmsg.contentType) {
    case MessageType.TextMessage:
        return DecryptoAES(pmsg.textElem.content);
    case MessageType.AtTextMessage:
        return parseAt(pmsg.atTextElem);
    case MessageType.PictureMessage:
        return "[图片]";
    case MessageType.VideoMessage:
        return "[视频]";
    case MessageType.VoiceMessage:
        return "[语音]";
    case MessageType.LocationMessage:
        return "[位置]";
    case MessageType.CardMessage:
        return "[名片]";
    case MessageType.MergeMessage:
        return "[合并消息]";
    case MessageType.FileMessage:
        return `[文件]${pmsg.fileElem.fileName}`;
    case MessageType.RevokeMessage:
        const data = JSON.parse(pmsg.notificationElem.detail);
        const revoker = isSelf(data.revokerID) ? "你" : data.revokerNickname;
        const sourcer = isSelf(data.sourceMessageSendID)
            ? "你"
            : data.sourceMessageSenderNickname;
        const isAdminRevoke = data.revokerID !== data.sourceMessageSendID;
        if (isAdminRevoke) {
            return `${revoker}撤回了一条${sourcer}的消息`;
        }
        return `${revoker}撤回了一条消息`;
    case MessageType.CustomMessage:
        const customEl = pmsg.customElem;
        const customData = JSON.parse(customEl.data);
        if (customData.customType) {
            return switchCustomMsg(customData);
        }
        return "[自定义消息]";
    case MessageType.QuoteMessage:
        return "[引用消息]";
    case MessageType.FaceMessage:
        return "[表情]";
    case MessageType.FriendAdded:
        return "你们已经是好友了，开始聊天吧~";
    case MessageType.MemberEnter:
        const enterDetails = JSON.parse(pmsg.notificationElem.detail);
        const enterUser = enterDetails.entrantUser;
        return `${getName(enterUser)}进入了群聊`;
    case MessageType.GroupCreated:
        const groupCreatedDetail = JSON.parse(pmsg.notificationElem.detail);
        const groupCreatedUser = groupCreatedDetail.opUser;
        return `${getName(groupCreatedUser)}创建了群聊`;
    case MessageType.MemberInvited:
        const inviteDetails = JSON.parse(pmsg.notificationElem.detail);
        const inviteOpUser = inviteDetails.opUser;
        const invitedUserList = inviteDetails.invitedUserList ?? [];
        let inviteStr = "";
        invitedUserList.find(
            (user, idx) => (inviteStr += getName(user) + " ") && idx > 3
        );
        return `${getName(inviteOpUser)}邀请了${inviteStr}${
            invitedUserList.length > 3 ? "..." : ""
        }进入群聊`;

    case MessageType.MemberKicked:
        const kickDetails = JSON.parse(pmsg.notificationElem.detail);
        const kickOpUser = kickDetails.opUser;
        const kickdUserList = kickDetails.kickedUserList ?? [];
        let kickStr = "";
        kickdUserList.find(
            (user, idx) => (kickStr += getName(user) + " ") && idx > 3
        );
        return `${getName(kickOpUser)}踢出了${kickStr}${
            kickdUserList.length > 3 ? "..." : ""
        }`;
    case MessageType.MemberQuit:
        const quitDetails = JSON.parse(pmsg.notificationElem.detail);
        const quitUser = quitDetails.quitUser;
        return `${getName(quitUser)}退出了群聊`;
    case MessageType.GroupInfoUpdated:
        const groupUpdateDetail = JSON.parse(pmsg.notificationElem.detail);
        const groupUpdateUser = groupUpdateDetail.opUser;
        let updateFiled = "群设置";
        if (groupUpdateDetail.group.notification) {
            updateFiled = "群公告";
        }
        if (groupUpdateDetail.group.groupName) {
            updateFiled = `群名称为 ${groupUpdateDetail.group.groupName}`;
        }
        if (groupUpdateDetail.group.faceURL) {
            updateFiled = "群头像";
        }
        if (groupUpdateDetail.group.introduction) {
            updateFiled = "群介绍";
        }
        return `${getName(groupUpdateUser)}修改了${updateFiled}`;
    case MessageType.GroupOwnerTransferred:
        const transferDetails = JSON.parse(pmsg.notificationElem.detail);
        const transferOpUser = transferDetails.opUser;
        const newOwner = transferDetails.newGroupOwner;
        return `${getName(transferOpUser)}将群主转让给${getName(newOwner)}`;
    case MessageType.GroupDismissed:
        const dismissDetails = JSON.parse(pmsg.notificationElem.detail);
        const dismissUser = dismissDetails.opUser;
        return `${getName(dismissUser)}解散了群聊`;
    case MessageType.GroupMuted:
        const GROUPMUTEDDetails = JSON.parse(pmsg.notificationElem.detail);
        const groupMuteOpUser = GROUPMUTEDDetails.opUser;
        return `${getName(groupMuteOpUser)}开启了全体禁言`;
    case MessageType.GroupCancelMuted:
        const GROUPCANCELMUTEDDetails = JSON.parse(pmsg.notificationElem.detail);
        const groupCancelMuteOpUser = GROUPCANCELMUTEDDetails.opUser;
        return `${getName(groupCancelMuteOpUser)}取消了全体禁言`;
    case MessageType.GroupMemberMuted:
        const gmMutedDetails = JSON.parse(pmsg.notificationElem.detail);
        const muteTime = sec2Time(gmMutedDetails.mutedSeconds);
        return `${getName(gmMutedDetails.opUser)}禁言了${getName(
            gmMutedDetails.mutedUser
        )} ${muteTime}`;
    case MessageType.GroupMemberCancelMuted:
        const gmcMutedDetails = JSON.parse(pmsg.notificationElem.detail);
        return `${getName(gmcMutedDetails.opUser)}取消了禁言${getName(
            gmcMutedDetails.mutedUser
        )}`;
    case MessageType.GroupAnnouncementUpdated:
        const groupAnnouncementUpdateDetail = JSON.parse(
            pmsg.notificationElem.detail
        );
        const groupAnnouncementUpdateUser = groupAnnouncementUpdateDetail.opUser;
        return `${getName(groupAnnouncementUpdateUser)}修改了群公告`;
    case MessageType.GroupNameUpdated:
        const groupNameUpdateDetail = JSON.parse(pmsg.notificationElem.detail);
        const groupNameUpdateUser = groupNameUpdateDetail.opUser;
        return `${getName(groupNameUpdateUser)}修改了群名称为${
            groupNameUpdateDetail.group.groupName
        }`;
    case MessageType.OANotification:
        const customNoti = JSON.parse(pmsg.notificationElem.detail);
        return customNoti.text;
    case MessageType.BurnMessageChange:
        const burnDetails = JSON.parse(pmsg.notificationElem.detail);
        return `阅后即焚已${burnDetails.isPrivate ? "开启" : "关闭"}`;
    default:
        return "";
    }
};

export const formatConversionTime = (timestemp) => {
    const fromNowStr = dayjs(timestemp).fromNow();

    if (fromNowStr.includes("秒")) {
        return "刚刚";
    }

    if (!fromNowStr.includes("秒") && !fromNowStr.includes("分钟")) {
        return dayjs(timestemp).calendar();
    }

    return fromNowStr;
};

export const secFormat = (sec) => {
    let h;
    let s;
    h = Math.floor(sec / 60);
    s = sec % 60;
    h += "";
    s += "";
    h = h.length === 1 ? "0" + h : h;
    s = s.length === 1 ? "0" + s : s;
    return h + ":" + s;
};

export const bytesToSize = (bytes) => {
    if (bytes === 0) return "0 B";
    let k = 1024,
        sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
        i = Math.floor(Math.log(bytes) / Math.log(k));

    return (bytes / Math.pow(k, i)).toFixed(1) + " " + sizes[i];
};

export const tipMessaggeFormat = (msg, currentUserID) => {
    if (msg.contentType === MessageType.RevokeMessage) {
        let revoker, sourcer, isAdminRevoke;
        const data = JSON.parse(msg.notificationElem.detail);
        revoker = currentUserID === data.revokerID ? "你" : data.revokerNickname;
        isAdminRevoke = data.revokerID !== data.sourceMessageSendID;
        sourcer =
      data.sourceMessageSendID === currentUserID
          ? "你"
          : data.sourceMessageSenderNickname;

        if (isAdminRevoke) {
            return `${revoker}撤回了一条${sourcer}的消息`;
        }
        return `${revoker}撤回了一条消息`;
    }

    const getName = (user) => {
        return user.userID === currentUserID ? "你" : user.nickname;
    };

    switch (msg.contentType) {
    case MessageType.FriendAdded:
        return `你们已经是好友了~`;
    case MessageType.GroupCreated:
        const groupCreatedDetail = JSON.parse(msg.notificationElem.detail);
        const groupCreatedUser = groupCreatedDetail.opUser;
        return `${getName(groupCreatedUser)}创建了群聊`;
    case MessageType.GroupInfoUpdated:
        const groupUpdateDetail = JSON.parse(msg.notificationElem.detail);
        const groupUpdateUser = groupUpdateDetail.opUser;
        let updateFiled = "群设置";
        if (groupUpdateDetail.group.notification) {
            updateFiled = "群公告";
        }
        if (groupUpdateDetail.group.groupName) {
            updateFiled = `群名称为 ${groupUpdateDetail.group.groupName}`;
        }
        if (groupUpdateDetail.group.faceURL) {
            updateFiled = "群头像";
        }
        if (groupUpdateDetail.group.introduction) {
            updateFiled = "群介绍";
        }
        return `${getName(groupUpdateUser)}修改了${updateFiled}`;
    case MessageType.GroupOwnerTransferred:
        const transferDetails = JSON.parse(msg.notificationElem.detail);
        const transferOpUser = transferDetails.opUser;
        const newOwner = transferDetails.newGroupOwner;
        return `${getName(transferOpUser)}转让群主给${getName(newOwner)}`;
    case MessageType.MemberQuit:
        const quitDetails = JSON.parse(msg.notificationElem.detail);
        const quitUser = quitDetails.quitUser;
        return `${getName(quitUser)}退出了群组`;
    case MessageType.MemberInvited:
        const inviteDetails = JSON.parse(msg.notificationElem.detail);
        const inviteOpUser = inviteDetails.opUser;
        const invitedUserList = inviteDetails.invitedUserList ?? [];
        let inviteStr = "";
        invitedUserList.find(
            (user, idx) => (inviteStr += getName(user) + " ") && idx > 3
        );
        return `${getName(inviteOpUser)}邀请了${inviteStr}${
            invitedUserList.length > 3 ? "..." : ""
        }加入群聊`;
    case MessageType.MemberKicked:
        const kickDetails = JSON.parse(msg.notificationElem.detail);
        const kickOpUser = kickDetails.opUser;
        const kickdUserList = kickDetails.kickedUserList ?? [];
        let kickStr = "";
        kickdUserList.find(
            (user, idx) => (kickStr += getName(user) + " ") && idx > 3
        );
        return `${getName(kickOpUser)}踢出了${kickStr}${
            kickdUserList.length > 3 ? "..." : ""
        }`;
    case MessageType.MemberEnter:
        const enterDetails = JSON.parse(msg.notificationElem.detail);
        const enterUser = enterDetails.entrantUser;
        return `${getName(enterUser)}加入了群聊`;
    case MessageType.GroupDismissed:
        const dismissDetails = JSON.parse(msg.notificationElem.detail);
        const dismissUser = dismissDetails.opUser;
        return `${getName(dismissUser)}解散了群聊`;
    case MessageType.GroupMuted:
        const groupMutedDetails = JSON.parse(msg.notificationElem.detail);
        const groupMuteOpUser = groupMutedDetails.opUser;
        return `${getName(groupMuteOpUser)}开启了全体禁言`;
    case MessageType.GroupCancelMuted:
        const groupCancelMutedDetails = JSON.parse(msg.notificationElem.detail);
        const groupCancelMuteOpUser = groupCancelMutedDetails.opUser;
        return `${getName(groupCancelMuteOpUser)}关闭了全体禁言`;
    case MessageType.GroupMemberMuted:
        const gmMutedDetails = JSON.parse(msg.notificationElem.detail);
        const muteTime = sec2Time(gmMutedDetails.mutedSeconds);
        return `${getName(gmMutedDetails.opUser)}禁言了${getName(
            gmMutedDetails.mutedUser
        )} ${muteTime}`;
    case MessageType.GroupMemberCancelMuted:
        const gmcMutedDetails = JSON.parse(msg.notificationElem.detail);
        return `${getName(gmcMutedDetails.opUser)}取消了禁言${getName(
            gmcMutedDetails.mutedUser
        )}`;
    case MessageType.GroupNameUpdated:
        const groupNameUpdateDetail = JSON.parse(msg.notificationElem.detail);
        const groupNameUpdateUser = groupNameUpdateDetail.opUser;
        return `${getName(groupNameUpdateUser)}修改了群名称为${
            groupNameUpdateDetail.group.groupName
        }`;
    case MessageType.BurnMessageChange:
        const burnDetails = JSON.parse(msg.notificationElem.detail);
        return `阅后即焚已${burnDetails.isPrivate ? "开启" : "关闭"}`;
    case MessageType.OANotification:
        const customNoti = JSON.parse(msg.notificationElem.detail);
        return customNoti.text;
    default:
        return "";
    }
};

export const getDesignatedUserOnlineState = (userID) => {
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
        resolve(onlineStr);
    });
};

function switchOnline (oType, details) {
    switch (oType) {
    case "offline":
        return "离线";
    case "online":
        let str = "";
        details?.map((detail) => {
            if (detail.status === "online") {
                str += `${detail.platform}/`;
            }
        });
        return `${str.slice(0, -1)} 在线`;
    default:
        return "";
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

export const prepareConversationState = (conversation, back2Tab = false, clientMsgID = '') => {
    markConversationAsRead(conversation);

    if (conversation.conversationType === SessionType.WorkingGroup) {
        store.dispatch("conversation/getCurrentGroup", conversation.groupID);
        store.dispatch(
            "conversation/getCurrentMemberInGroup",
            conversation.groupID
        );
    }
    store.dispatch("message/resetMessageState");
    store.commit("conversation/SET_CURRENT_CONVERSATION", conversation);

    let url = `/pages/conversation/chating/index?back2Tab=${back2Tab}&clientMsgID=${clientMsgID}`;
    if (conversation.conversationType === SessionType.Notification) {
        url = "/pages/conversation/notifyMessageList/index";
    }
    uni.navigateTo({
        url,
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
                    sourceID,
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
    clientMsgID = ''
) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { data } = await IMSDK.asyncApi(
                IMSDK.IMMethods.GetMultipleConversation,
                IMSDK.uuid(),
                [conversationID]
            );
            prepareConversationState(data[0], back2Tab, clientMsgID);
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

export const scanQrCodeResult = (result) => {
    if (result?.includes(AddFriendQrCodePrefix)) {
        const userID = result.replace(AddFriendQrCodePrefix, "");
        uni.navigateTo({
            url: `/pages/common/userCard/index?sourceID=${userID}&isScan=true`,
        });
    } else if (result?.includes(AddGroupQrCodePrefix)) {
        const groupID = result.replace(AddGroupQrCodePrefix, "");
        uni.navigateTo({
            url: `/pages/common/groupCard/index?sourceID=${groupID}&isScan=true`,
        });
    } else {
        uni.$u.toast("未识别到有效内容");
    }
};

export const offlinePushInfo = {
    title: "you have a new message",
    desc: "you have a new message",
    ex: "",
    iOSPushSound: "",
    iOSBadgeCount: true,
};

export const getSourceUserInfo = (sourceID) => {
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
                    ...users[0],
                };
            }
            resolve({
                ...info,
            });
        } catch (e) {
            uni.$u.toast("获取用户信息失败");
            reject(e);
        }
    });
};

export const uploadFile = async (path, contentType = 'image') => {
    const nameIdx = path.lastIndexOf('/') + 1;
    const typeIdx = path.lastIndexOf('.') + 1;
    const fileName = path.slice(nameIdx);
    const fileType = path.slice(typeIdx);
    const { data: { url }, } = await IMSDK.asyncApi(
        IMSDK.IMMethods.UploadFile,
        IMSDK.uuid(),
        {
            filepath: getPurePath(path),
            name: fileName,
            contentType: `${contentType}/${fileType}`,
            uuid: IMSDK.uuid(),
        }
    );
    return url;
};

export const messageGetConversationID = (message) => {
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