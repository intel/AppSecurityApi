/******************************************************************************
"Copyright (c) 2015-2015, Intel Corporation
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation
    and/or other materials provided with the distribution.
3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this
    software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
"
******************************************************************************/

var ErrorCodes =
{
    'Memory allocation failure': 2,
    'Data integrity violation detected': 8,
    'Internal error occurred': 1000
};



function SecureDataGetSize(instanceID, dataSizeArray) {
    if ((dataSizeArray instanceof Array) && (dataSizeArray.length == 1)) {
        var code = IntelSecurityServicesWRC.SecureDataWRC.secureDataGetDataSizeWRC(instanceID, dataSizeArray);
        return code;
    }
    else {
        return ErrorCodes["Internal error occurred"];
    }
}

function SecureDataGetSealedSize(instanceID, dataSizeArray) {
    if ((dataSizeArray instanceof Array) && (dataSizeArray.length == 1)) {
        var code = IntelSecurityServicesWRC.SecureDataWRC.secureDataGetSealedSizeWRC(instanceID, dataSizeArray);
        return code;
    }
    else {
        return ErrorCodes["Internal error occurred"];
    }

}

function SecureDataGetTagSize(instanceID, tagSize) {
    if ((tagSize instanceof Array) && (tagSize.length == 1)) {
        var code = IntelSecurityServicesWRC.SecureDataWRC.secureDataGetTagSizeWRC(instanceID, tagSize);
        return code;
    }
    else {
        return ErrorCodes["Internal error occurred"];
    }
}

function SecureDataGetOwnerNumber(instanceID, ownersNumber) {
    if ((ownersNumber instanceof Array) && (ownersNumber.length == 1)) {
        var code = IntelSecurityServicesWRC.SecureDataWRC.secureDataGetNumberOfOwnersWRC(instanceID, ownersNumber);
        return code;
    }
    else {
        return ErrorCodes["Internal error occurred"];
    }
}

//SecureData class		
var secureData = {
    SecureDataCreateFromData: function (success, fail, optionsArray) {
        try {

            //case the optionsArray is not an array or its length does not equal to 7
            if ((optionsArray instanceof Array) && (optionsArray.length == 11)) {
                var instanceIDArray = null;
                try {
                    instanceIDArray = new Array(1);
                    //enforcing instanceID's first cell to be an integer
                    instanceIDArray[0] = 0;
                }
                catch (e) {
                    fail(ErrorCodes['Memory allocation failure']);
                    return;
                }
                var data = optionsArray[0];
                var tag = optionsArray[1];
                var extraKey = optionsArray[2];
                var appAccessControl = optionsArray[3];
                var deviceLocality = optionsArray[4];
                var sensitivityLevel = optionsArray[5];
                var noStore = optionsArray[6];
                var noRead = optionsArray[7];
                var creator = optionsArray[8];
                var owners = optionsArray[9];
                var webDomains = optionsArray[10];
             
                var returnCode = IntelSecurityServicesWRC.SecureDataWRC.secureDataCreateFromDataWRC(data, tag, extraKey,
                        appAccessControl, deviceLocality, sensitivityLevel, creator, owners, 0, noStore, noRead, webDomains, instanceIDArray);

				data = null;        //hint to the GC
                if (returnCode === 0) {
                    success(instanceIDArray[0]);
                }
                else {
                    fail(returnCode);
                }
            }
            else {
                fail(ErrorCodes["Internal error occurred"]);
            }
        }
        catch (e) {
            fail(ErrorCodes["Internal error occurred"]);
        }
    },

    SecureDataCreateFromSealedData: function (success, fail, optionsArray) {

        try {
            //case the optionsArray is not an array or its length does not equal to 1
            if ((optionsArray instanceof Array) && (optionsArray.length == 2)) {
                //converts the data from a base64 string to byte array
                var decodedString = "";
                try {
                    decodedString = window.atob(optionsArray[0]);
                    
                }
                catch (e) {
                    // sealedData is not in base64 format -- invalid sealedData
                    fail(ErrorCodes["Data integrity violation detected"]);
                    return;
                }
                var uintArray = decodedString.split(",");
                var i = 0;

                var instanceIDArray = null;
                try {
                    instanceIDArray = new Array(1);
                    //enforcing instanceID's first cell to be an integer
                    instanceIDArray[0] = 0;
                }
                catch (e) {
                    fail(ErrorCodes['Memory allocation failure']);
                    return;
                }

                for (i = 0; i < uintArray.length; i++) {
                    if(isNaN(uintArray[i]))
                    {
                        fail(ErrorCodes["Data integrity violation detected"]);
                        return;
                    }
                    uintArray[i] = parseInt(uintArray[i]);
                }

                var extraKey = optionsArray[1];
                var returnCode = IntelSecurityServicesWRC.SecureDataWRC.secureDataCreateFromSealedDataWRC(uintArray, extraKey, instanceIDArray);
                if (returnCode === 0) {
                    success(instanceIDArray[0]);
                }
                else {
                    fail(returnCode);
                }
            }
            else {
                fail(ErrorCodes["Internal error occurred"]);
            }
        }
        catch (e) {
            fail(ErrorCodes["Internal error occurred"]);
        }

    },

    SecureDataChangeExtraKey: function (success, fail, optionsArray) {
        if ((optionsArray instanceof Array) && (optionsArray.length == 2)) {
            try {
                var instanceID = Number(optionsArray[0]);
                var extraKeyInstanceID = Number(optionsArray[1]);
                var returnCode = IntelSecurityServicesWRC.SecureDataWRC.secureDataChangeExtraKeyWRC(instanceID, extraKeyInstanceID);
                if (returnCode !== 0) {
                    fail(returnCode);
                }
                else {
                    success(returnCode);
                }
            }
            catch (e) {
                fail(ErrorCodes["Internal error occurred"]);
            }
        }
        else {
            fail(ErrorCodes["Internal error occurred"]);
        }
    },

    SecureDataGetData: function (success, fail, optionsArray) {

        if ((optionsArray instanceof Array) && (optionsArray.length == 1)) {
            try {
                var instanceID = Number(optionsArray[0]);

                var retArray = null;
                try {
                    retArray = new Array(1);
                }
                catch (e) {
                    fail(ErrorCodes['Memory allocation failure']);
                    return;
                }

                var data = IntelSecurityServicesWRC.SecureDataWRC.secureDataGetDataWRC(instanceID, retArray);
                if (retArray[0] === 0) {
                    success(data);
                }
                else {
                    fail(retArray[0]);
                }

            }
            catch (e) {
                fail(ErrorCodes["Internal error occurred"]);
            }
        }
        else {
            fail(ErrorCodes["Internal error occurred"]);
        }
    },

    SecureDataGetSealedData: function (success, fail, optionsArray) {

        if ((optionsArray instanceof Array) && (optionsArray.length == 1)) {
            try {
                var instanceID = Number(optionsArray[0]);
                var dataSizeArray = null;
                try {
                    dataSizeArray = new Array(1);
                }
                catch (e) {
                    fail(ErrorCodes['Memory allocation failure']);
                    return;
                }
                var returnCode = SecureDataGetSealedSize(instanceID, dataSizeArray);
                if (returnCode !== 0) {
                    fail(returnCode);
                    return;
                }
                else {

                    //dataSizeArray is greater than 0
                    if (dataSizeArray[0] > 0) {
                        var dataArray = null;
                        try {
                            dataArray = new Array(dataSizeArray[0]);
                        }
                        catch (e) {
                            fail(ErrorCodes['Memory allocation failure']);
                            return;
                        }

                        returnCode = IntelSecurityServicesWRC.SecureDataWRC.secureDataGetSealedDataWRC(instanceID, dataSizeArray[0], dataArray);
                        if (returnCode !== 0) {
                            fail(returnCode);
                        }
                        else {
                            var dataString = "";
                            //convert data to base64 string using btoa function
                            dataString = window.btoa(dataArray);
                            success(dataString);
                        }
                    }
                        //dataSizeArray is 0 or less
                    else {
                        fail(ErrorCodes["Internal error occurred"]);
                    }

                }
            }
            catch (e) {
                fail(ErrorCodes["Internal error occurred"]);
            }
        }
        else {
            fail(ErrorCodes["Internal error occurred"]);
        }
    },

    SecureDataGetTag: function (success, fail, optionsArray) {

        if ((optionsArray instanceof Array) && (optionsArray.length == 1)) {
            try {
                var instanceID = Number(optionsArray[0]);

                var retArray = null;
                try {
                    retArray = new Array(1);
                }
                catch (e) {
                    fail(ErrorCodes['Memory allocation failure']);
                    return;
                }
               
                var tag = IntelSecurityServicesWRC.SecureDataWRC.secureDataGetTagWRC(instanceID, retArray);
                if (retArray[0] === 0) {
                    success(tag);
                }
                else {
                    fail(retArray[0]);
                }

            }
            catch (e) {
                fail(ErrorCodes["Internal error occurred"]);
            }
        }
        else {
            fail(ErrorCodes["Internal error occurred"]);
        }

    },

    SecureDataGetPolicy: function (success, fail, optionsArray) {
        if ((optionsArray instanceof Array) && (optionsArray.length == 1)) {
            try {
                var instanceID = Number(optionsArray[0]);
                var policyArray = null;
                try {
                    policyArray = new Array(5);
                }
                catch (e) {
                    fail(ErrorCodes['Memory allocation failure']);
                    return;
                }

                var returnCode = IntelSecurityServicesWRC.SecureDataWRC.secureDataGetPolicyWRC(instanceID, policyArray);
                if (returnCode !== 0) {
                    fail(returnCode);
                }
                else {
                    var policy = {
                        appAccessControl: policyArray[0],
                        deviceLocality: policyArray[1],
                        sensitivityLevel: policyArray[2],
                        noStore: policyArray[3],
                        noRead: policyArray[4],
                    };
                    success(policy);
                }
            }
            catch (e) {
                fail(ErrorCodes["Internal error occurred"]);
            }
        }
        else {
            fail(ErrorCodes["Internal error occurred"]);
        }


    },

    SecureDataGetOwners: function (success, fail, optionsArray) {

        if ((optionsArray instanceof Array) && (optionsArray.length == 1)) {
            try {
                var instanceID = Number(optionsArray[0]);
                var dataSizeArray = null;
                try {
                    dataSizeArray = new Array(1);
                }
                catch (e) {
                    fail(ErrorCodes['Memory allocation failure']);
                    return;
                }
                var returnCode = SecureDataGetOwnerNumber(instanceID, dataSizeArray);
                if (returnCode !== 0) {
                    fail(returnCode);
                }
                else {
                    if (dataSizeArray[0] > 0) {
                        var ownersArray = null;
                        try {
                            ownersArray = new Array(dataSizeArray[0]);
                        }
                        catch (e) {
                            fail(ErrorCodes['Memory allocation failure']);
                            return;
                        }

                        returnCode = IntelSecurityServicesWRC.SecureDataWRC.secureDataGetOwnersWRC(instanceID, dataSizeArray[0], ownersArray);
                        if (returnCode === 0) {
                            success(ownersArray);
                        }
                        else {
                            fail(returnCode);
                        }
                    }
                    else {
                        fail(ErrorCodes["Internal error occurred"]);
                    }
                }
            }
            catch (e) {
                fail(ErrorCodes["Internal error occurred"]);
            }
        }
        else {
            fail(ErrorCodes["Internal error occurred"]);
        }

    },

    SecureDataGetCreator: function (success, fail, optionsArray) {

        if ((optionsArray instanceof Array) && (optionsArray.length == 1)) {
            try {
                var instanceID = Number(optionsArray[0]);
                var dataArray = null;
                try {
                    dataArray = new Array(1);
                }
                catch (e) {
                    fail(ErrorCodes['Memory allocation failure']);
                    return;
                }

                var returnCode = IntelSecurityServicesWRC.SecureDataWRC.secureDataGetCreatorWRC(instanceID, dataArray);
                if (returnCode !== 0) {
                    fail(returnCode);
                }
                else {
                    success(dataArray[0]);
                }
            }
            catch (e) {
                fail(ErrorCodes["Internal error occurred"]);
            }
        }
        else {
            fail(ErrorCodes["Internal error occurred"]);
        }


    },
    SecureDataGetWebOwners: function (success, fail, optionsArray) {

        if ((optionsArray instanceof Array) && (optionsArray.length == 1)) {
            try {
                var instanceID = Number(optionsArray[0]);

                var retArray = null;
                try {
                    retArray = new Array(1);
                }
                catch (e) {
                    fail(ErrorCodes['Memory allocation failure']);
                    return;
                }
		
                var webOwners = IntelSecurityServicesWRC.SecureDataWRC.secureDataGetTrustedWebDomainsListWRC(instanceID, retArray);
                if (retArray[0] === 0) {
                    success(webOwners);
                }
                else {
                    fail(retArray[0]);
                }
            }
            catch (e) {
                fail(ErrorCodes["Internal error occurred"]);
            }
        }
    },

    SecureDataDestroy: function (success, fail, optionsArray) {
        if ((optionsArray instanceof Array) && (optionsArray.length == 1)) {
            try {
                var instanceID = Number(optionsArray[0]);
                var returnCode = IntelSecurityServicesWRC.SecureDataWRC.secureDataDestroyWRC(instanceID);
                if (returnCode !== 0) {
                    fail(returnCode);
                }
                else {
                    success(returnCode);
                }
            }
            catch (e) {
                fail(ErrorCodes["Internal error occurred"]);
            }
        }
        else {
            fail(ErrorCodes["Internal error occurred"]);
        }


    }

};

//SecureStorage class		
var secureStorage = {
    SecureStorageRead: function (success, fail, optionsArray) {

        if ((optionsArray instanceof Array) && (optionsArray.length == 3)) {
            try {

                var handleArray = null;
                try {
                    handleArray = new Array(1);
                }
                catch (e) {
                    fail(ErrorCodes['Memory allocation failure']);
                    return;
                }
                var id = optionsArray[0];
                var storageType = optionsArray[1];
                var extraKey = optionsArray[2];
                var returnCode = IntelSecurityServicesWRC.SecureStorageWRC.secureStorageReadWRC(id, storageType, extraKey, handleArray);
                if (returnCode === 0) {
                    success(handleArray[0]);
                }
                else {
                    fail(returnCode);
                }
            }
            catch (e) {
                fail(ErrorCodes["Internal error occurred"]);
            }
        }
        else {
            fail(ErrorCodes["Internal error occurred"]);
        }


    },

    SecureStorageWrite: function (success, fail, optionsArray) {
        if ((optionsArray instanceof Array) && (optionsArray.length == 3)) {
            try {
                var returnCode = IntelSecurityServicesWRC.SecureStorageWRC.secureStorageWriteWRC(optionsArray[0], optionsArray[1], optionsArray[2]);
                if (returnCode === 0) {
                    success();
                }
                else {
                    fail(returnCode);
                }
            }
            catch (e) {
                fail(ErrorCodes["Internal error occurred"]);
            }
        }
        else {
            fail(ErrorCodes["Internal error occurred"]);
        }
    },

    SecureStorageDelete: function (success, fail, optionsArray) {
        if ((optionsArray instanceof Array) && (optionsArray.length == 2)) {
            try {

                var returnCode = IntelSecurityServicesWRC.SecureStorageWRC.secureStorageDeleteWRC(optionsArray[0], optionsArray[1]);
                if (returnCode === 0) {
                    success();
                }
                else {
                    fail(returnCode);
                }
            }
            catch (e) {
                fail(ErrorCodes["Internal error occurred"]);
            }
        }
        else {
            fail(ErrorCodes["Internal error occurred"]);
        }


    }
};

//SecureTransport class		
var secureTransport = {

    SecureTransportOpen: function (success, fail, optionsArray) {

        if ((optionsArray instanceof Array) && (optionsArray.length == 4)) {
            try {
                var url = optionsArray[0];
                var method = optionsArray[1];
                var serverKey = optionsArray[2];
                var timeout = optionsArray[3];
                var instanceIDArray = null;
                try {
                    instanceIDArray = new Array(1);
                    //enforcing instanceID's first cell to be an integer
                    instanceIDArray[0] = 0;
                }
                catch (e) {
                    fail(ErrorCodes['Memory allocation failure']);
                    return;
                }
                var returnCode = IntelSecurityServicesWRC.SecureTransportWRC.secureTransportOpenWRC(url, method, serverKey, timeout, instanceIDArray);
                if (returnCode === 0) {
                    success(instanceIDArray[0]);
                }
                else {
                    fail(returnCode);
                }
            }
            catch (e) {
                fail(ErrorCodes["Internal error occurred"]);
            }
        }
        else {
            fail(ErrorCodes["Internal error occurred"]);
        }


    },

    SecureTransportSetURL: function (success, fail, optionsArray) {
        if ((optionsArray instanceof Array) && (optionsArray.length == 2)) {
            try {
                var instanceID = optionsArray[0];
                var url = optionsArray[1];

                var returnCode = IntelSecurityServicesWRC.SecureTransportWRC.secureTransportSetURLWRC(instanceID, url);
               
                if (returnCode === 0) {
                    success();
                }
                else {
                    fail(returnCode);
                }
            }
            catch (e) {
                fail(ErrorCodes["Internal error occurred"]);
            }
        }
        else {
            fail(ErrorCodes["Internal error occurred"]);
        }
    },

    SecureTransportSetHeaderValue: function (success, fail, optionsArray) {
        if ((optionsArray instanceof Array) && (optionsArray.length == 3)) {
            try {
                var instanceID = optionsArray[0];
                var url = optionsArray[1];
                var value = optionsArray[2];
                var returnCode = IntelSecurityServicesWRC.SecureTransportWRC.secureTransportSetHeaderValueWRC(instanceID, url, value);
                if (returnCode === 0) {
                    success();
                }
                else {
                    fail(returnCode);
                }
            }
            catch (e) {
                fail(ErrorCodes["Internal error occurred"]);
            }
        }
        else {
            fail(ErrorCodes["Internal error occurred"]);
        }
    },

    SecureTransportSendRequest: function (success, fail, optionsArray) {
        if ((optionsArray instanceof Array) && (optionsArray.length == 4)) {
            try {
                var instanceID = optionsArray[0];
                var requestBody = optionsArray[1];
                var requestFormat = optionsArray[2];
                var secureDataDescriptors = optionsArray[3];
                var nativeObject = new IntelSecurityServicesWRC.SecureTransportWRC();
                nativeObject.secureTransportSendRequestWRCAsync(instanceID, requestBody, requestFormat, secureDataDescriptors)
                    .then(function (jsonResponse) {
                        try{
                            var jsonResponseObject = JSON.parse(jsonResponse);
                            if (jsonResponseObject.code === 0) {
                                
                                success({ 'responseHeader': jsonResponseObject.headers, 'responseBody': jsonResponseObject.body });
                            }
                            else {
                                fail(jsonResponseObject.code);
                            }
                        }
                        catch (e) {
                            fail(ErrorCodes["Internal error occurred"]);
                        }
                    })
                    .then(function (err) {
                        //error
                        fail(ErrorCodes["Internal error occurred"]);
                    }, function (prog) {
                        //shouldn't be called
                        fail(ErrorCodes["Internal error occurred"]);
                    });
            }
            catch (e) {
                fail(ErrorCodes["Internal error occurred"]);
            }
        }
        else {
            fail(ErrorCodes["Internal error occurred"]);
        }


    },
    
    SecureTransportDestroy: function (success, fail, optionsArray) {
        if ((optionsArray instanceof Array) && (optionsArray.length == 1)) {
            try {
                var instanceID = optionsArray[0];
                var returnCode = IntelSecurityServicesWRC.SecureTransportWRC.secureTransportDestroyWRC(instanceID);
                if (returnCode === 0) {
                    success();
                }
                else {
                    fail(returnCode);
                }
            }
            catch (e) {
                fail(ErrorCodes["Internal error occurred"]);
            }
        }
        else {
            fail(ErrorCodes["Internal error occurred"]);
        }


    },

    SecureTransportSetMethod: function (success, fail, optionsArray) {
        if ((optionsArray instanceof Array) && (optionsArray.length == 2)) {
            try {
                var instanceID = optionsArray[0];
                var method = optionsArray[1];

                var returnCode = IntelSecurityServicesWRC.SecureTransportWRC.secureTransportSetMethodWRC(instanceID, method);

                if (returnCode === 0) {
                    success();
                }
                else {
                    fail(returnCode);
                }
            }
            catch (e) {
                fail(ErrorCodes["Internal error occurred"]);
            }
        }
        else {
            fail(ErrorCodes["Internal error occurred"]);
        }


    },

};

//imlemenation of all the APIs by thier API name on the bridge (cordova.exec)
module.exports = {
    //Secure Data
    SecureDataCreateFromData: function (success, fail, option) {

        secureData.SecureDataCreateFromData(success, fail, option);

    },
    SecureDataCreateFromSealedData: function (success, fail, sealedData) {

        secureData.SecureDataCreateFromSealedData(success, fail, sealedData);
    },
    SecureDataChangeExtraKey: function (success, fail, sealedData) {

        secureData.SecureDataChangeExtraKey(success, fail, sealedData);
    },
    SecureDataGetData: function (success, fail, instanceID) {

        secureData.SecureDataGetData(success, fail, instanceID);
    },
    SecureDataGetSealedData: function (success, fail, instanceID) {

        secureData.SecureDataGetSealedData(success, fail, instanceID);
    },
    SecureDataGetTag: function (success, fail, instanceID) {

        secureData.SecureDataGetTag(success, fail, instanceID);
    },
    SecureDataGetPolicy: function (success, fail, instanceID) {

        secureData.SecureDataGetPolicy(success, fail, instanceID);
    },
    SecureDataGetOwners: function (success, fail, instanceID) {

        secureData.SecureDataGetOwners(success, fail, instanceID);
    },
    SecureDataGetCreator: function (success, fail, instanceID) {

        secureData.SecureDataGetCreator(success, fail, instanceID);
    },
    SecureDataGetWebOwners: function (success, fail, instanceID) {

        secureData.SecureDataGetWebOwners(success, fail, instanceID);
    },
    //Secure Storage
    SecureDataDestroy: function (success, fail, instanceID) {

        secureData.SecureDataDestroy(success, fail, instanceID);
    },
    SecureStorageRead: function (success, fail, option) {

        secureStorage.SecureStorageRead(success, fail, option);
    },
    SecureStorageWrite: function (success, fail, option) {

        secureStorage.SecureStorageWrite(success, fail, option);
    },
    SecureStorageDelete: function (success, fail, option) {

        secureStorage.SecureStorageDelete(success, fail, option);
    },
    //Secure Transport
    SecureTransportOpen: function (success, fail, instanceID) {
        secureTransport.SecureTransportOpen(success, fail, instanceID);
    },
    SecureTransportSetURL: function (success, fail, option) {

        secureTransport.SecureTransportSetURL(success, fail, option);
    },
    SecureTransportSetMethod: function (success, fail, option) {

        secureTransport.SecureTransportSetMethod(success, fail, option);
    },
    SecureTransportSetHeaderValue: function (success, fail, option) {

        secureTransport.SecureTransportSetHeaderValue(success, fail, option);
    },
    SecureTransportSendRequest: function (success, fail, option) {

        secureTransport.SecureTransportSendRequest(success, fail, option);
    },
    SecureTransportDestroy: function (success, fail, option) {

        secureTransport.SecureTransportDestroy(success, fail, option);
    }
};

//Namespace of the bridge
require("cordova/exec/proxy").add("IntelSecurity", module.exports);


