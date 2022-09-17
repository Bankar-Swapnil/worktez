const {getSubscriptions} = require("../lib");

exports.getSubscriptionDetails = function(request, response) {
    const orgAppKey = request.body.data.OrgAppKey;
    let status = 200;
    let result;

    getSubscriptions(orgAppKey, "").then((sData) => {
        if(sData){
            result = {data: {status: "OK", resultData: sData}};
            return response.status(status).send(result);
        }
    }).catch((error) => {
        status = 500;
        result = {data: error};
        console.error("Error getting subscription data", error);
        return response.status(status).send(result);
    });
};