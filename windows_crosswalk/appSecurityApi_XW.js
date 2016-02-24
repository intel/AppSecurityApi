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
/**
 * This section has the helper functions
 */
/**
 * "Constants" definitions
 */
var MAX_SAFE_INTEGER_VALUE = 9007199254740991; // ((2^53)-1)		

/**
 * Helper associative array:
 * Associative array of the error code  
 */
var errorMessageMap = {
    1: 'File system error occurred',
    2: 'Memory allocation failure',
    3: 'Invalid storage identifier provided',
    4: 'Number of owners is invalid',
    5: 'Bad owner/creator persona provided',
    6: 'Invalid data policy provided',
    7: 'Bad data, tag or extra key length provided',
    8: 'Data integrity violation detected',
    9: 'Invalid instance ID provided',
    10: 'Invalid storage type provided',
    11: 'Storage Identifier Already In Use',
    12: 'Argument type inconsistency detected',
    13: 'Policy violation detected',
    14: 'Invalid web owners list size',
    16: 'Server not accessible error',
    17: 'Communication timeout error',
    18: 'Communication generic error',
    19: 'Invalid descriptor structure',
    20: 'Invalid descriptor path',
    21: 'Invalid descriptor handle',
    22: 'Invalid timeout',
    23: 'Descriptors not supported for request format',
    24: 'Invalid request format',
    26: 'Invalid request body structure',
    29: 'Bad URL',
    30: 'Invalid HTTP method',
    32: 'Invalid certificate format',
    33: 'Communication authentication error',
    34: 'Invalid argument size',
    35: 'Incorrect state',
    36: 'Action aborted',
    1000: 'Internal error occurred',
};

/**
 * Helper function:
 * Creates an internal error object
 */
function createInternalError() {
    return new errorObj(1000, 'Internal error occurred');
}

/**
 * Helper function:
 * Converts error code (number or string that can be converted to number) to errorObj
 * @param {Number/String} strNum - the error code number (or string that can be converted to number)
 * @param {Function} success - the success callback to be called in case of success convert
 * @param {Function} fail - the fail callback to be called in case the error code can't be converted to errorObj (called only if success callback is provided)
 */
function successConvertToNumber(strNum, success, fail) {
    if (typeof success === 'function') {
        if (typeof strNum === 'string') {
            success(parseInt(strNum, 10));
        } else if (typeof strNum === 'number') {
            success(strNum);
        } else if (typeof fail === 'function') {
            fail(createInternalError());
        }
    }
}

/**
 * Helper function:
 * Wrapper function that calls the fail callback
 * @param {Number} code - the error code number (from bridge) or string (from JS)
 * @param {Function} fail - the fail callback  
 */
function failInternal(code, fail) {
    if (typeof fail === 'function') {
        var errObj;
        if ((typeof code === 'number') &&
            (errorMessageMap.hasOwnProperty(code))) {
            errObj = new errorObj(code, errorMessageMap[code]);
        } else if (typeof code === 'string') {
            for (var c in errorMessageMap) {
                if (errorMessageMap[c] === code) {
                    errObj = new errorObj(Number(c), code);
                    break;
                }
            }
        }
        if (typeof errObj === 'undefined') {
            errObj = createInternalError();
        }
        fail(errObj);
    }
}

/**
 * Helper function:
 * Checks if val is a valid non-negative safe integer
 * @param {Number} val - number in which check should be performed
 */
function isValidNonNegativeSafeInteger(val) {
    return ((typeof val == 'number') &&
        (!isNaN(parseInt(val))) &&
        (isFinite(val)) &&
        (Math.floor(val) === val) &&
        (Math.abs(val) <= MAX_SAFE_INTEGER_VALUE) &&
        (val >= 0));
}

/**
 * Helper function:
 * Checks if arr is a valid array of unsigned integer
 * @param {Array} arr - array in which check should be performed
 */
function isValidNonNegativeSafeIntegersArray(arr) {
    if (arr instanceof Array === false) {
        return false;
    }
    for (var i = 0; i < arr.length; i++) {
        if (!isValidNonNegativeSafeInteger(arr[i])) {
            return false;
        }
    }
    return true;
}

/**
 * Helper function:
 * Checks if val is of valid boolean type.
 * @param {Number} val - the bool val to check
 */
function isBoolean(val) {
    return (typeof val == 'boolean');
}

/**
 * Helper function:
 * Checks if val is a number with boolean value '1' or '0'.
 * @param {Number} val - the number val to check
 */
function isNumberBooleanValue(val) {
    return (val !== 0 && val !== 1);
}
/**
 * Helper function:
 * Checks if the object is empty {}
 * @param {Object} object - the object to check
 */
function isEmptyObject(object) {
    for (var element in object) {
        if (object.hasOwnProperty(element))
            return false;
    }
    return true;
}

function safeJSONParse(jsonString) {
    var parsedString = "";
    try {
        parsedString = JSON.parse(jsonString);
    } catch (err) {
        return "";
    }
    return parsedString;
}

var IntelSecurityServicesSecureData = {
    createFromData_exec: function (success, fail, service, action, args) {
        var response_handler = function (msg) {
            var responseArr = safeJSONParse(msg);
            if (responseArr === "") return;
            if (responseArr.errorCode === 0) {
                success(responseArr.instanceID);
            } else {
                fail(responseArr.errorCode);
            }
        }

        args["megafunction"] = "securedata";
        args["megafunction_method"] = "createfromdata";
        IntelSecurityServicesExtension.exec(args, response_handler);
    },
    createFromSealedData_exec: function (success, fail, service, action, args) {
        var response_handler = function (msg) {
            var responseArr = safeJSONParse(msg);
            if (responseArr === "") return;
            if (responseArr.errorCode === 0) {
                success(responseArr.instanceID);
            } else {
                fail(responseArr.errorCode);
            }
        }

        args["megafunction"] = "securedata";
        args["megafunction_method"] = "createfromsealeddata";
        IntelSecurityServicesExtension.exec(args, response_handler);

    },
    changeExtraKey_exec: function (success, fail, service, action, args) {
        var response_handler = function (msg) {
            var responseArr = safeJSONParse(msg);
            if (responseArr === "") return;
            if (responseArr.errorCode === 0) {
                success();
            } else {
                fail(responseArr.errorCode);
            }
        }

        args["megafunction"] = "securedata";
        args["megafunction_method"] = "changeextrakey";
        IntelSecurityServicesExtension.exec(args, response_handler);
    },
    getData_exec: function (success, fail, service, action, args) {
        var response_handler = function (msg) {
            var responseArr = safeJSONParse(msg);
            if (responseArr === "") return;
            if (responseArr.errorCode === 0) {
                success(responseArr.retData);
            } else {
                fail(responseArr.errorCode);
            }
        }

        args["megafunction"] = "securedata";
        args["megafunction_method"] = "getdata";
        IntelSecurityServicesExtension.exec(args, response_handler);
    },
    getSealedData_exec: function (success, fail, service, action, args) {
        var response_handler = function (msg) {
            var responseArr = safeJSONParse(msg);
            if (responseArr === "") return;
            if (responseArr.errorCode === 0) {
                success(responseArr.retData);
            } else {
                fail(responseArr.errorCode);
            }
        }

        args["megafunction"] = "securedata";
        args["megafunction_method"] = "getsealeddata";
        IntelSecurityServicesExtension.exec(args, response_handler);
    },
    getTag_exec: function (success, fail, service, action, args) {
        var response_handler = function (msg) {
            var responseArr = safeJSONParse(msg);
            if (responseArr === "") return;
            if (responseArr.errorCode === 0) {
                success(responseArr.retTag);
            } else {
                fail(responseArr.errorCode);
            }
        }
        args["megafunction"] = "securedata";
        args["megafunction_method"] = "gettag";
        IntelSecurityServicesExtension.exec(args, response_handler);

    },
    getPolicy_exec: function (success, fail, service, action, args) {
        var response_handler = function (msg) {
            var responseArr = safeJSONParse(msg);
            if (responseArr === "") return;
            if (responseArr.errorCode === 0) {
                success(responseArr.policy);
            } else {
                fail(responseArr.errorCode);
            }
        }

        args["megafunction"] = "securedata";
        args["megafunction_method"] = "getpolicy";
        IntelSecurityServicesExtension.exec(args, response_handler);

    },
    getOwners_exec: function (success, fail, service, action, args) {
        var response_handler = function (msg) {
            var responseArr = safeJSONParse(msg);
            if (responseArr === "") return;
            if (responseArr.errorCode === 0) {
                success(responseArr.owners);
            } else {
                fail(responseArr.errorCode);
            }
        }

        args["megafunction"] = "securedata";
        args["megafunction_method"] = "getowners";
        IntelSecurityServicesExtension.exec(args, response_handler);

    },
    getCreator_exec: function (success, fail, service, action, args) {

        var response_handler = function (msg) {
            var responseArr = safeJSONParse(msg);
            if (responseArr === "") return;
            if (responseArr.errorCode === 0) {
                success(responseArr.retCreator);
            } else {
                fail(responseArr.errorCode);
            }
        }

        args["megafunction"] = "securedata";
        args["megafunction_method"] = "getcreator";
        IntelSecurityServicesExtension.exec(args, response_handler);

    },
    getWebOwners_exec: function (success, fail, service, action, args) {
        var response_handler = function (msg) {
            var responseArr = safeJSONParse(msg);
            if (responseArr === "") return;
            if (responseArr.errorCode === 0) {
                success(responseArr.retWebOwners);
            } else {
                fail(responseArr.errorCode);
            }
        }

        args["megafunction"] = "securedata";
        args["megafunction_method"] = "getwebowners";
        IntelSecurityServicesExtension.exec(args, response_handler);

    },
    destroy_exec: function (success, fail, service, action, args) {
        var response_handler = function (msg) {
            var responseArr = safeJSONParse(msg);
            if (responseArr === "") return;
            if (responseArr.errorCode === 0) {
                success();
            } else {
                fail(responseArr.errorCode);
            }
        }

        args["megafunction"] = "securedata";
        args["megafunction_method"] = "destroy";
        IntelSecurityServicesExtension.exec(args, response_handler);

    }
};
/**
 * Secure Data Mega Function
 * More details can be found in the API documentation
 */
var _secureData = {
    createFromData: function (success, fail, options) {
        options = options || {};
        var defaults = {
            data: '',
            tag: '',
            webOwners: [],
            extraKey: 0,
            appAccessControl: 0,
            deviceLocality: 0,
            sensitivityLevel: 0,
            noStore: false,
            noRead: false,
            creator: 0,
            owners: [0]
        };
        for (var key in defaults) {
            if (options[key] !== undefined) {
                defaults[key] = options[key];
            }
        }
        // check input type
        if ((typeof defaults.data !== 'string') ||
            (typeof defaults.tag !== 'string') ||
            (typeof defaults.webOwners !== 'object') ||
            (!Array.isArray(defaults.webOwners)) ||
            (!isValidNonNegativeSafeInteger(defaults.extraKey)) ||
            (!isValidNonNegativeSafeInteger(defaults.appAccessControl)) ||
            (!isValidNonNegativeSafeInteger(defaults.deviceLocality)) ||
            (!isValidNonNegativeSafeInteger(defaults.sensitivityLevel)) ||
            (!isBoolean(defaults.noStore)) ||
            (!isBoolean(defaults.noRead)) ||
            (!isValidNonNegativeSafeInteger(defaults.creator)) ||
            (!isValidNonNegativeSafeIntegersArray(defaults.owners))) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            var webOwnersJSON = "[]";
            try {
                webOwnersJSON = JSON.stringify(defaults.webOwners);
            } catch (e) {
                failInternal('Argument type inconsistency detected', fail);
                return;
            }
            defaults["webOwnersJSON"] = webOwnersJSON;
            IntelSecurityServicesSecureData.createFromData_exec(
                function (instanceID) {
                    successConvertToNumber(instanceID, success, fail);
                },
                function (code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureDataCreateFromData',
                defaults);
        }
    },
    createFromSealedData: function (success, fail, options) {
        options = options || {};
        var defaults = {
            sealedData: '',
            extraKey: 0
        };
        for (var key in defaults) {
            if (options[key] !== undefined) {
                defaults[key] = options[key];
            }
        }
        if ((typeof defaults.sealedData !== 'string') ||
            (!isValidNonNegativeSafeInteger(defaults.extraKey))) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            IntelSecurityServicesSecureData.createFromSealedData_exec(
                function (instanceID) {
                    successConvertToNumber(instanceID, success, fail);
                },
                function (code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureDataCreateFromSealedData',
                defaults);
        }
    },
    changeExtraKey: function (success, fail, options) {
        options = options || {};
        var defaults = {
            instanceID: 0,
            extraKey: 0
        };
        for (var key in defaults) {
            if (options[key] !== undefined) {
                defaults[key] = options[key];
            }
        }
        if (!isValidNonNegativeSafeInteger(defaults.instanceID) ||
            !isValidNonNegativeSafeInteger(defaults.extraKey)) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            IntelSecurityServicesSecureData.changeExtraKey_exec(
                success,
                function (code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureDataChangeExtraKey',
                defaults);
        }
    },
    getData: function (success, fail, instanceID) {
        if (!isValidNonNegativeSafeInteger(instanceID)) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            IntelSecurityServicesSecureData.getData_exec(
                success,
                function (code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureDataGetData', {
                    instanceID: instanceID
                });
        }
    },
    getSealedData: function (success, fail, instanceID) {
        if (!isValidNonNegativeSafeInteger(instanceID)) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            IntelSecurityServicesSecureData.getSealedData_exec(
                success,
                function (code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureDataGetSealedData', {
                    instanceID: instanceID
                });
        }
    },
    getTag: function (success, fail, instanceID) {
        if (!isValidNonNegativeSafeInteger(instanceID)) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            var args = {
                instanceID: instanceID
            };
            IntelSecurityServicesSecureData.getTag_exec(
                success,
                function (code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureDataGetTag',
                args);
        }
    },
    getPolicy: function (success, fail, instanceID) {
        if (!isValidNonNegativeSafeInteger(instanceID)) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            var args = {
                instanceID: instanceID
            };
            IntelSecurityServicesSecureData.getPolicy_exec(
                function (policy) {
                    if (isNumberBooleanValue(policy.noStore) || isNumberBooleanValue(policy.noRead)) {
                        failInternal('Internal error occurred', fail);
                        return;
                    }
                    policy.noStore = Boolean(policy.noStore);
                    policy.noRead = Boolean(policy.noRead);
                    success(policy);
                },
                function (code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureDataGetPolicy',
                args);
        }
    },
    getOwners: function (success, fail, instanceID) {
        if (!isValidNonNegativeSafeInteger(instanceID)) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            var args = {
                instanceID: instanceID
            };
            IntelSecurityServicesSecureData.getOwners_exec(
                success,
                function (code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureDataGetOwners',
                args);
        }
    },
    getCreator: function (success, fail, instanceID) {
        if (!isValidNonNegativeSafeInteger(instanceID)) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            IntelSecurityServicesSecureData.getCreator_exec(
                function (instanceID) {
                    successConvertToNumber(instanceID, success, fail);
                },
                function (code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureDataGetCreator', {
                    instanceID: instanceID
                });
        }
    },
    getWebOwners: function (success, fail, instanceID) {
        if (!isValidNonNegativeSafeInteger(instanceID)) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            var args = {
                instanceID: instanceID
            };
            IntelSecurityServicesSecureData.getWebOwners_exec(
                function (webOwnersString) {
                    try {
                        var webOwnersArray = JSON.parse(webOwnersString);
                        success(webOwnersArray);
                    } catch (e) {
                        failInternal("Internal error occurred", fail);
                    }
                },
                function (code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureDataGetWebOwners',
                args);
        }
    },

    destroy: function (success, fail, instanceID) {
        if (!isValidNonNegativeSafeInteger(instanceID)) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            IntelSecurityServicesSecureData.destroy_exec(
                success,
                function (code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureDataDestroy', {
                    instanceID: instanceID
                });
        }
    },
};

var IntelSecurityServicesSecureStorage = {
    read_exec: function (success, fail, service, action, args) {
        var response_handler = function (msg) {
            var responseArr = safeJSONParse(msg);
            if (responseArr === "") return;
            if (responseArr.errorCode === 0) {
                success(responseArr.instanceID);
            } else {
                fail(responseArr.errorCode);
            }
        }

        args["megafunction"] = "securestorage";
        args["megafunction_method"] = "read";
        IntelSecurityServicesExtension.exec(args, response_handler);

    },
    writeSecureData_exec: function (success, fail, service, action, args) {
        var response_handler = function (msg) {
            var responseArr = safeJSONParse(msg);
            if (responseArr === "") return;
            if (responseArr.errorCode === 0) {
                success();
            } else {
                fail(responseArr.errorCode);
            }
        }

        args["megafunction"] = "securestorage";
        args["megafunction_method"] = "writesecuredata";
        IntelSecurityServicesExtension.exec(args, response_handler);

    },
    write_exec: function (success, fail, service, action, args) {
        var response_handler = function (msg) {
            var responseArr = safeJSONParse(msg);
            if (responseArr === "") return;
            if (responseArr.errorCode === 0) {
                success();
            } else {
                fail(responseArr.errorCode);
            }
        }

        args["megafunction"] = "securestorage";
        args["megafunction_method"] = "write";
        IntelSecurityServicesExtension.exec(args, response_handler);

    },
    delete_exec: function (success, fail, service, action, args) {
        var response_handler = function (msg) {
            var responseArr = safeJSONParse(msg);
            if (responseArr === "") return;
            if (responseArr.errorCode === 0) {
                success();
            } else {
                fail(responseArr.errorCode);
            }
        }

        args["megafunction"] = "securestorage";
        args["megafunction_method"] = "delete";
        IntelSecurityServicesExtension.exec(args, response_handler);

    },
};
/**
 * Secure Storage Mega Function
 * More details can be found in the API documentation
 */
var _secureStorage = {
    read: function (success, fail, options) {
        options = options || {};
        var defaults = {
            id: '',
            storageType: 0,
            extraKey: 0
        };
        for (var key in defaults) {
            if (options[key] !== undefined) {
                defaults[key] = options[key];
            }
        }
        if ((typeof defaults.id !== 'string') ||
            (!isValidNonNegativeSafeInteger(defaults.storageType)) ||
            (!isValidNonNegativeSafeInteger(defaults.extraKey))) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            IntelSecurityServicesSecureStorage.read_exec(
                function (instanceID) {
                    successConvertToNumber(instanceID, success, fail);
                },
                function (code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureStorageRead',
                defaults);
        }
    },
    write: function (success, fail, options) {
        options = options || {};
        var defaults = {
            id: '',
            storageType: 0,
            instanceID: 0,
        };
        for (var key in defaults) {
            if (options[key] !== undefined) {
                defaults[key] = options[key];
            }
        }
        if ((typeof defaults.id !== 'string') ||
            (!isValidNonNegativeSafeInteger(defaults.storageType)) ||
            (!isValidNonNegativeSafeInteger(defaults.instanceID))) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            IntelSecurityServicesSecureStorage.write_exec(
                success,
                function (code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureStorageWrite',
                defaults);
        }
    },
    delete: function (success, fail, options) {
        options = options || {};
        var defaults = {
            id: '',
            storageType: 0,
        };
        for (var key in defaults) {
            if (options[key] !== undefined) {
                defaults[key] = options[key];
            }
        }
        if ((typeof defaults.id !== 'string') ||
            (!isValidNonNegativeSafeInteger(defaults.storageType))) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            IntelSecurityServicesSecureStorage.delete_exec(
                success,
                function (code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureStorageDelete',
                defaults);
        }
    },
};

/**
 * Secure Transport Mega Function
 * More details can be found in the API documentation
 */

var IntelSecurityServicesSecureTransport = {
    open_exec: function (success, fail, service, action, args) {
        var response_handler = function (msg) {
            var responseArr = safeJSONParse(msg);
            if (responseArr === "") return;
            if (responseArr.errorCode === 0) {
                success(responseArr.instanceID);
            } else {
                fail(responseArr.errorCode);
            }
        }

        args["megafunction"] = "securetransport";
        args["megafunction_method"] = "open";
        IntelSecurityServicesExtension.exec(args, response_handler);

    },
    setURL_exec: function (success, fail, service, action, args) {
        var response_handler = function (msg) {
            var responseArr = safeJSONParse(msg);
            if (responseArr === "") return;
            if (responseArr.errorCode === 0) {
                success();
            } else {
                fail(responseArr.errorCode);
            }
        }

        args["megafunction"] = "securetransport";
        args["megafunction_method"] = "seturl";
        IntelSecurityServicesExtension.exec(args, response_handler);

    },
    setMethod_exec: function (success, fail, service, action, args) {
        var response_handler = function (msg) {
            var responseArr = safeJSONParse(msg);
            if (responseArr === "") return;
            if (responseArr.errorCode === 0) {
                success();
            } else {
                fail(responseArr.errorCode);
            }
        }

        args["megafunction"] = "securetransport";
        args["megafunction_method"] = "setmethod";
        IntelSecurityServicesExtension.exec(args, response_handler);

    },
    setHeaders_exec: function (success, fail, service, action, args) {
        var response_handler = function (msg) {
            var responseArr = safeJSONParse(msg);
            if (responseArr === "") return;
            if (responseArr.errorCode === 0) {
                success();
            } else {
                fail(responseArr.errorCode);
            }
        }

        args["megafunction"] = "securetransport";
        args["megafunction_method"] = "setheaders";
        IntelSecurityServicesExtension.exec(args, response_handler);

    },
    sendRequest_exec: function (success, fail, service, action, args) {
        var response_handler = function (msg) {
            var responseArr = safeJSONParse(msg);
            if (responseArr === "") return;
            if (responseArr.errorCode === 0) {
                success(responseArr);
            } else {
                fail(responseArr.errorCode);
            }
        }

        args["megafunction"] = "securetransport";
        args["megafunction_method"] = "sendrequest";
        IntelSecurityServicesExtension.exec(args, response_handler);

    },
    abort_exec: function (success, fail, service, action, args) {
        var response_handler = function (msg) {
            var responseArr = safeJSONParse(msg);
            if (responseArr === "") return;
            if (responseArr.errorCode === 0) {
                success();
            } else {
                fail(responseArr.errorCode);
            }
        }

        args["megafunction"] = "securetransport";
        args["megafunction_method"] = "abort";
        IntelSecurityServicesExtension.exec(args, response_handler);

    },
    destroy_exec: function (success, fail, service, action, args) {
        var response_handler = function (msg) {
            var responseArr = safeJSONParse(msg);
            if (responseArr === "") return;
            if (responseArr.errorCode === 0) {
                success();
            } else {
                fail(responseArr.errorCode);
            }
        }

        args["megafunction"] = "securetransport";
        args["megafunction_method"] = "destroy";
        IntelSecurityServicesExtension.exec(args, response_handler);

    }
};

var _secureTransport = {

    httpMethodType: {
        'GET': 0,
        'POST': 1,
        'PUT': 2,
        'DELETE': 3,
        'HEAD': 4,
        'OPTIONS': 5
    },
    requestFormatType: {
        'GENERIC': 0,
        'JSON': 1,
        'XML': 2,
    },
    open: function (success, fail, options) {

        options = options || {};
        //default value for the optional parameters
        var defaults = {
            url: '',
            method: 'GET',
            serverKey: '',
            timeout: 10000
        };
        //setting the default values in case they were not provided
        for (var key in defaults) {
            if (options[key] !== undefined) {
                defaults[key] = options[key];
            }
        }
        if ((typeof defaults.url !== 'string') ||
            (typeof defaults.method !== 'string') ||
            (typeof defaults.serverKey !== 'string') ||
            (!isValidNonNegativeSafeInteger(defaults.timeout))) {
            failInternal('Argument type inconsistency detected', fail);
        } else if (this.httpMethodType.hasOwnProperty(defaults.method) === false) {
            failInternal('Invalid HTTP method', fail);
        } else {
            // convert method from string to number            
            defaults.method = this.httpMethodType[defaults.method];
            IntelSecurityServicesSecureTransport.open_exec(
                function (instanceID) {
                    successConvertToNumber(instanceID, success, fail);
                },
                function (code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureTransportOpen', defaults);
        }
    },
    setURL: function (success, fail, options) {

        options = options || {};
        //default value for the optional parameters
        var defaults = {
            instanceID: 0,
            url: '',
            serverKey: ''
        };
        //setting the default values in case they were not provided
        for (var key in defaults) {
            if (options[key] !== undefined) {
                defaults[key] = options[key];
            }
        }
        if ((!isValidNonNegativeSafeInteger(defaults.instanceID)) ||
            (typeof defaults.serverKey !== 'string') ||
            (typeof defaults.url !== 'string')) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            IntelSecurityServicesSecureTransport.setURL_exec(
                success,
                function (code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureTransportSetURL', defaults);
        }
    },
    setMethod: function (success, fail, options) {

        options = options || {};
        //default value for the optional parameters
        var defaults = {
            instanceID: 0,
            method: ''
        };
        //setting the default values in case they were not provided
        for (var key in defaults) {
            if (options[key] !== undefined) {
                defaults[key] = options[key];
            }
        }
        if ((!isValidNonNegativeSafeInteger(defaults.instanceID)) ||
            (typeof defaults.method !== 'string')) {
            failInternal('Argument type inconsistency detected', fail);
        } else if (this.httpMethodType.hasOwnProperty(defaults.method) === false) {
            failInternal('Invalid HTTP method', fail);
        } else {
            // convert method from string to number            
            defaults.method = this.httpMethodType[defaults.method];
            IntelSecurityServicesSecureTransport.setMethod_exec(
                success,
                function (code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureTransportSetMethod', defaults);
        }
    },
    setHeaders: function (success, fail, options) {
        options = options || {};
        //default value for the optional parameters
        var defaults = {
            instanceID: 0,
            headers: {}
        };
        //setting the default values in case they were not provided
        for (var key in defaults) {
            if (options[key] !== undefined) {
                defaults[key] = options[key];
            }
        }
        if ((!isValidNonNegativeSafeInteger(defaults.instanceID)) || (typeof defaults.headers !== 'object')) {
            failInternal('Argument type inconsistency detected', fail);
            return;
        }
        if (Array.isArray(defaults.headers)) {
            failInternal('Argument type inconsistency detected', fail);
            return;
        }
        for (var key in defaults.headers) {
            if (typeof key !== 'string' || key === '' || typeof defaults.headers[key] !== 'string') {
                failInternal('Argument type inconsistency detected', fail);
                return;
            }
        }
        var headersJSON = "";
        if (!isEmptyObject(defaults.headers)) {
            try {
                headersJSON = JSON.stringify(defaults.headers);
            } catch (e) {
                failInternal('Argument type inconsistency detected', fail);
                return;
            }
        }
        defaults.headers = headersJSON;
        IntelSecurityServicesSecureTransport.setHeaders_exec(
            success,
            function (code) {
                failInternal(code, fail);
            },
            'IntelSecurity',
            'SecureTransportSetHeaders', defaults);

    },
    sendRequest: function (success, fail, options) {

        options = options || {};
        //default value for the optional parameters
        var defaults = {
            instanceID: 0,
            requestBody: '',
            requestFormat: 'GENERIC',
            secureDataDescriptors: []
        };
        //setting the default values in case they were not provided
        for (var key in defaults) {
            if (options[key] !== undefined) {
                defaults[key] = options[key];
            }
        }
        if ((!isValidNonNegativeSafeInteger(defaults.instanceID)) ||
            (typeof defaults.requestBody !== 'string') ||
            (typeof defaults.requestFormat !== 'string') ||
            (!(defaults.secureDataDescriptors instanceof Array))) {
            failInternal('Argument type inconsistency detected', fail);
        } else if (this.requestFormatType.hasOwnProperty(defaults.requestFormat) === false) {
            failInternal('Invalid request format', fail);
        } else {
            // convert format from string to number
            defaults.requestFormat = this.requestFormatType[defaults.requestFormat];
            var secureDataDescriptorsJSON = null;
            try {
                secureDataDescriptorsJSON = JSON.stringify(defaults.secureDataDescriptors);
            } catch (e) {
                failInternal('Internal error occurred', fail);
                return;
            }
            defaults.secureDataDescriptors = secureDataDescriptorsJSON;
            IntelSecurityServicesSecureTransport.sendRequest_exec(
                success,
                function (code) {
                    failInternal(code, function (errObj) {
                        if ((errObj.message !== 'Action aborted') &&
                            (typeof fail === 'function')) {
                            fail(errObj);
                        }
                    });
                },
                'IntelSecurity',
                'SecureTransportSendRequest', defaults);
        }
    },
    abort: function (success, fail, instanceID) {

        if (!isValidNonNegativeSafeInteger(instanceID)) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            IntelSecurityServicesSecureTransport.abort_exec(
                success,
                function (code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureTransportAbort', {
                    instanceID: instanceID
                });
        }
    },
    destroy: function (success, fail, instanceID) {

        if (!isValidNonNegativeSafeInteger(instanceID)) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            IntelSecurityServicesSecureTransport.destroy_exec(
                success,
                function (code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureTransportDestroy', {
                    instanceID: instanceID
                });
        }
    }
};

/** 
 * Constructor that creates an intel.security.errorObject object
 * @param {Number} code - the error code number
 * @param {String} message - the error message string
 * More details can be found in the API documentation
 */
function errorObj(code, message) {
    this.code = code;
    this.message = message;
}

/**
 * Cordova export: 
 *  - intel.security.secureData
 *  - intel.security.secureStorage
 *  - intel.security.errorObject
 */
var _security = {
    //	globalInit		: _globalInit,
    secureData: _secureData,
    secureStorage: _secureStorage,
    secureTransport: _secureTransport

};

var intel = {
    security: _security
};
