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

/**
 * Secure Data Mega Function
 * More details can be found in the API documentation
 */

function _globalInitConstructor() {
    cordova.addConstructor(function() {
        cordova.exec(function() {}, function(code) {}, 'IntelSecurity', 'GlobalInit', []);
    });
}
var _globalInit = new _globalInitConstructor();


var _secureData = {
    createFromData: function(success, fail, options) {
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
            cordova.exec(
                function(instanceID) {
                    successConvertToNumber(instanceID, success, fail);
                },
                function(code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureDataCreateFromData', [defaults.data, defaults.tag, defaults.extraKey, defaults.appAccessControl, defaults.deviceLocality, defaults.sensitivityLevel,
                    Number(defaults.noStore), Number(defaults.noRead), defaults.creator, defaults.owners, webOwnersJSON
                ]);
        }
    },
    createFromSealedData: function(success, fail, options) {
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
            cordova.exec(
                function(instanceID) {
                    successConvertToNumber(instanceID, success, fail);
                },
                function(code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureDataCreateFromSealedData', [defaults.sealedData, defaults.extraKey]);
        }
    },
    changeExtraKey: function(success, fail, options) {
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
            cordova.exec(
                success,
                function(code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureDataChangeExtraKey', [defaults.instanceID, defaults.extraKey]);
        }
    },
    getData: function(success, fail, instanceID) {
        if (!isValidNonNegativeSafeInteger(instanceID)) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            cordova.exec(
                success,
                function(code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureDataGetData', [instanceID]);
        }
    },
    getSealedData: function(success, fail, instanceID) {
        if (!isValidNonNegativeSafeInteger(instanceID)) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            cordova.exec(
                success,
                function(code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureDataGetSealedData', [instanceID]);
        }
    },
    getTag: function(success, fail, instanceID) {
        if (!isValidNonNegativeSafeInteger(instanceID)) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            cordova.exec(
                success,
                function(code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureDataGetTag', [instanceID]);
        }
    },
    getPolicy: function(success, fail, instanceID) {
        if (!isValidNonNegativeSafeInteger(instanceID)) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            cordova.exec(
                function(policy) {
                    if (isNumberBooleanValue(policy.noStore) || isNumberBooleanValue(policy.noRead)) {
                        failInternal('Internal error occurred', fail);
                    }
                    policy.noStore = Boolean(policy.noStore);
                    policy.noRead = Boolean(policy.noRead);
                    success(policy);
                },
                function(code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureDataGetPolicy', [instanceID]);
        }
    },
    getOwners: function(success, fail, instanceID) {
        if (!isValidNonNegativeSafeInteger(instanceID)) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            cordova.exec(
                success,
                function(code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureDataGetOwners', [instanceID]);
        }
    },
    getCreator: function(success, fail, instanceID) {
        if (!isValidNonNegativeSafeInteger(instanceID)) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            cordova.exec(
                function(instanceID) {
                    successConvertToNumber(instanceID, success, fail);
                },
                function(code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureDataGetCreator', [instanceID]);
        }
    },
    getWebOwners: function(success, fail, instanceID) {
        if (!isValidNonNegativeSafeInteger(instanceID)) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            cordova.exec(
                function(webOwnersString) {
                    try {
                        var webOwnersArray = JSON.parse(webOwnersString);
                        success(webOwnersArray);
                    } catch (e) {
                        failInternal("Internal error occurred", fail);
                    }
                },
                function(code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureDataGetWebOwners', [instanceID]);
        }
    },

    destroy: function(success, fail, instanceID) {
        if (!isValidNonNegativeSafeInteger(instanceID)) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            cordova.exec(
                success,
                function(code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureDataDestroy', [instanceID]);
        }
    },
};

/**
 * Secure Storage Mega Function
 * More details can be found in the API documentation
 */
var _secureStorage = {
    read: function(success, fail, options) {
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
            cordova.exec(
                function(instanceID) {
                    successConvertToNumber(instanceID, success, fail);
                },
                function(code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureStorageRead', [defaults.id, defaults.storageType, defaults.extraKey]);
        }
    },
    write: function(success, fail, options) {
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
            cordova.exec(
                success,
                function(code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureStorageWrite', [defaults.id, defaults.storageType, defaults.instanceID]);
        }
    },
    delete: function(success, fail, options) {
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
            cordova.exec(
                success,
                function(code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureStorageDelete', [defaults.id, defaults.storageType]);
        }
    },
};

/**
 * Secure Transport Mega Function
 * More details can be found in the API documentation
 */
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
    open: function(success, fail, options) {

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
            cordova.exec(
                function(instanceID) {
                    successConvertToNumber(instanceID, success, fail);
                },
                function(code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureTransportOpen', [defaults.url, defaults.method, defaults.serverKey, defaults.timeout]);
        }
    },
    setURL: function(success, fail, options) {

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
            cordova.exec(
                success,
                function(code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureTransportSetURL', [defaults.instanceID, defaults.url, defaults.serverKey]);
        }
    },
    setMethod: function(success, fail, options) {

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
            cordova.exec(
                success,
                function(code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureTransportSetMethod', [defaults.instanceID, defaults.method]);
        }
    },
    setHeaders: function(success, fail, options) {

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
        cordova.exec(
            success,
            function(code) {
                failInternal(code, fail);
            },
            'IntelSecurity',
            'SecureTransportSetHeaders', [defaults.instanceID, headersJSON]);

    },
    sendRequest: function(success, fail, options) {

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
            cordova.exec(
                success,
                function(code) {
                    failInternal(code, function(errObj) {
                        if ((errObj.message !== 'Action aborted') &&
                            (typeof fail === 'function')) {
                            fail(errObj);
                        }
                    });
                },
                'IntelSecurity',
                'SecureTransportSendRequest', [defaults.instanceID, defaults.requestBody, defaults.requestFormat, secureDataDescriptorsJSON]);
        }
    },
    abort: function(success, fail, instanceID) {

        if (!isValidNonNegativeSafeInteger(instanceID)) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            cordova.exec(
                success,
                function(code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureTransportAbort', [instanceID]);
        }
    },
    destroy: function(success, fail, instanceID) {

        if (!isValidNonNegativeSafeInteger(instanceID)) {
            failInternal('Argument type inconsistency detected', fail);
        } else {
            cordova.exec(
                success,
                function(code) {
                    failInternal(code, fail);
                },
                'IntelSecurity',
                'SecureTransportDestroy', [instanceID]);
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
module.exports = {
    //	globalInit		: _globalInit,
    secureData: _secureData,
    secureStorage: _secureStorage,
    secureTransport: _secureTransport,
    errorObject: errorObj,
};