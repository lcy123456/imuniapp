export const AddFriendQrCodePrefix = 'io.openim.app/addFriend/';
export const AddGroupQrCodePrefix = 'io.openim.app/joinGroup/';

export const ChatingFooterActionTypes = {
    Album: 'Album',
    Camera: 'Camera',
    Call: 'Call',
    File: 'File',
    Card: 'Card',
    Location: 'Location'
};

export const MessageMenuTypes = {
    Copy: 'Copy',
    AddEmoticons: 'AddEmoticons',
    Del: 'Del',
    DelAll: 'DelAll',
    Forward: 'Forward',
    ForwardAll: 'ForwardAll',
    Reply: 'Reply',
    Revoke: 'Revoke',
    Multiple: 'Multiple',
    Init: 'init',
    Pin: 'pin',
    PinCancel: 'pinCancel',
    Checked: 'checked',
    Edit: 'edit',
    ReadCount: 'readCount',
    Favorite: 'favorite'
};

export const ContactMenuTypes = {
    NewFriend: 'NewFriend',
    NewGroup: 'NewGroup',
    MyFriend: 'MyFriend',
    MyGroup: 'MyGroup',
    Lable: 'Lable'
};

export const GroupMemberListTypes = {
    Preview: 'Preview',
    Transfer: 'Transfer',
    Kickout: 'Kickout',
    ChooseAt: 'ChooseAt',
    CallInvite: 'CallInvite'
};

export const ContactChooseTypes = {
    Invite: 'Invite',
    GetList: 'GetList',
    Forward: 'forward'
};

export const UpdateMessageTypes = {
    Overall: 'Overall',
    KeyWords: 'KeyWords'
};

export const SmsUserFor = {
    Register: 1,
    Reset: 2,
    Login: 3
};

export const CommonIsAllow = {
    Allow: 1,
    NotAllow: 2
};

export const CustomMessageStatus = {
    Success: 'success',
    Cancel: 'cancel',
    Canceled: 'canceled',
    Refuse: 'refuse',
    Refused: 'refused',
    Timeout: 'timeout',
    AccessByOther: 'accessByOther'
};

export const CustomMarkType = {
    SelfNickname: 'selfNickname',
    Remark: 'remark',
    GroupName: 'groupName',
    AccountCancel: 'accountCancel'
};

export const ImageType = ['jpg', 'jpeg', 'png', 'gif'];
export const VideoType = ['mp4', 'avi', 'ogg', 'fiv'];

export const RecordFormMap = {
    All: 'All', // 全局查询
    Contact: 'Contact', // 好友查询
    Group: 'Group' // 群查询
};

export const RecordTypeMap = {
    Contact: 'Contact', // 联系人
    Group: 'Group', // 群组
    Record: 'Record', // 聊天记录
    Message: 'Message' // 记录消息
};
