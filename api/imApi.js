import store from '@/store';
import { v4 as uuidv4 } from 'uuid';

// 在线状态
export const getOnlineStateFromSvr = userID =>
    uni.$u?.http.post(
        '/user/get_users_online_status',
        JSON.stringify({
            userIDs: [userID]
        }),
        {
            custom: {
                isIMApi: true
            },
            header: {
                token: store.getters.storeIMToken
            }
        }
    );

// 在线状态
export const getRtcInvitaion = () =>
    uni.$u?.http.post(
        '/third/get_rtc_invitation_start_app',
        JSON.stringify({
            operationID: uuidv4()
        }),
        {
            custom: {
                isIMApi: true
            },
            header: {
                token: store.getters.storeIMToken
            }
        }
    );

export const getAllTags = () =>
    uni.$u?.http.post(
        '/office/get_user_tags',
        JSON.stringify({
            operationID: uuidv4()
        }),
        {
            custom: {
                isIMApi: true
            },
            header: {
                token: store.getters.storeIMToken
            }
        }
    );

export const createTag = (tagName, userIDList) =>
    uni.$u?.http.post(
        '/office/create_tag',
        JSON.stringify({
            tagName,
            userIDList,
            operationID: uuidv4()
        }),
        {
            custom: {
                isIMApi: true
            },
            header: {
                token: store.getters.storeIMToken
            }
        }
    );

export const deleteTag = tagID =>
    uni.$u?.http.post(
        '/office/delete_tag',
        JSON.stringify({
            tagID,
            operationID: uuidv4()
        }),
        {
            custom: {
                isIMApi: true
            },
            header: {
                token: store.getters.storeIMToken
            }
        }
    );

// tagID, increaseUserIDList, reduceUserIDList, newName;
export const updateTag = options =>
    uni.$u?.http.post(
        '/office/set_tag',
        JSON.stringify({
            ...options,
            operationID: uuidv4()
        }),
        {
            custom: {
                isIMApi: true
            },
            header: {
                token: store.getters.storeIMToken
            }
        }
    );

//   tagList, userList, groupList, senderPlatformID, content;
export const massMessage = options =>
    uni.$u?.http.post(
        '/office/send_msg_to_tag',
        JSON.stringify({
            ...options,
            operationID: uuidv4()
        }),
        {
            custom: {
                isIMApi: true
            },
            header: {
                token: store.getters.storeIMToken
            }
        }
    );

export const massList = (pageNumber, showNumber = 20) =>
    uni.$u?.http.post(
        '/office/get_send_tag_log',
        JSON.stringify({
            pageNumber,
            showNumber,
            operationID: uuidv4()
        }),
        {
            custom: {
                isIMApi: true
            },
            header: {
                token: store.getters.storeIMToken
            }
        }
    );

export const addBlack = ({ ownerUserID, blackUserID }) =>
    uni.$u?.http.post(
        '/friend/add_black',
        JSON.stringify({
            ownerUserID,
            blackUserID
        }),
        {
            custom: {
                isIMApi: true
            },
            header: {
                token: store.getters.storeIMToken
            }
        }
    );
export const removeBlack = ({ ownerUserID, blackUserID }) =>
    uni.$u?.http.post(
        '/friend/remove_black',
        JSON.stringify({
            ownerUserID,
            blackUserID
        }),
        {
            custom: {
                isIMApi: true
            },
            header: {
                token: store.getters.storeIMToken
            }
        }
    );
