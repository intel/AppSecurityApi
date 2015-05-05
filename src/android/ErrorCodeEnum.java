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
package com.intel.security;

public enum ErrorCodeEnum {
        
    FILE_SYSTEM_ERROR_OCCURRED(1),
    MEMORY_ALLOCATION_FAILURE(2),
    INVALID_STORAGE_IDENTIFIER_PROVIDED(3),
    NUMBER_OF_OWNERS_IS_INVALID(4),
    BAD_OWNER_OR_CREATOR_PERSONA_PROVIDED(5),
    INVALID_DATA_POLICY_PROVIDED(6),
    BAD_DATA_OR_TAG_OR_EXTRAKEY_LENGTH_PROVIDED(7),
    DATA_INTEGRITY_VIOLATION_DETECTED(8),
    INVALID_INSTANCE_ID_PROVIDED(9),
    INVALID_STORAGE_TYPE_PROVIDED(10),
    STORAGE_IDENTIFIER_ALREADY_IN_USE(11),
    ARGUMENT_TYPE_INCONSISTENCY_DETECTED(12),
	POLICY_VOILATION_DETECTED(13),
	INVALID_WEB_DOMAINS_LIST_SIZE(14),
    INTERNAL_ERROR_OCCURRED(1000);
    
    private int errorCode;
    private ErrorCodeEnum(int errorCode) {
        this.errorCode = errorCode;
    }
    public int getErrorCode(){
        return this.errorCode;
    }
    static public ErrorCodeEnum CreateErrorCodeEnum(int errorCode){
        
        for (ErrorCodeEnum err : ErrorCodeEnum.values()) {
            if (err.getErrorCode() == errorCode) {
                return err;
            }
        }       
        // did not find this error code
        return INTERNAL_ERROR_OCCURRED;        
    }
};
