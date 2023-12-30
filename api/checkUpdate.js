export const checkUpdateFormPgyer = buildVersion =>
    uni.$u?.http.post(
        '/apiv2/app/check',
        {
            _api_key: '6f43600074306e8bc506ed0cd3275e9e',
            appKey: 'f1ab52f730898cede342d7ff8e215bd1',
            buildVersion
        },
        {
            custom: {
                isPgyerApi: true
            },
            dataType: 'x-www-form-urlencoded',
            header: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );
