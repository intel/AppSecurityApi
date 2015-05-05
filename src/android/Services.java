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

import java.io.File;
import java.io.UnsupportedEncodingException;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;
import android.content.Context;
import android.provider.Settings;

public class Services extends CordovaPlugin {
  
	protected native int SetClassPtrToJni();
    static Context mContext = null ;
	
    private static Services instance = null;
    public static Services getInstance() 
    {
        return instance;
    }    
    
    private void SetSserviceContext()
    {
          instance = this ;
    }
    
    public Context GetSserviceContext()
    {
		return cordova.getActivity();
    }

    // load .so file    
    static {
        try {
            System.loadLibrary("SecurityServices");
        } catch (UnsatisfiedLinkError e) {
            // if failed to load the .so file then exit the app 
            System.exit(1); 
        }                
    }

    
    @Override
    public boolean execute(final String action, final JSONArray args, final CallbackContext callbackContext) throws JSONException {
        
        if (SecureAPIEnum.IsSupportedAPI(action)) {
            
                cordova.getThreadPool().execute(new Runnable() {
                    public void run() {                
                        try {
							SetSserviceContext();
							if (SetClassPtrToJni() == 0)
							{
								throw new ErrorCodeException(ErrorCodeEnum.INTERNAL_ERROR_OCCURRED);
							}
                            SecureAPIEnum api = SecureAPIEnum.CreateSecureAPIEnum(action);
                            switch (api) {
                                // Secure Data
                                case SECURE_DATA_CREATE_FROM_DATA:
                                    SecureDataCreateFromDataExecute(args, callbackContext);
                                    break;                                    
                                case SECURE_DATA_CREATE_FROM_SEALED_DATA:
                                    SecureDataCreateFromSealedDataExecute(args, callbackContext);
                                    break;                           
                                case SECURE_DATA_CHANGE_EXTRA_KEY:
                                	SecureDataChangeExtraKeyExecute(args, callbackContext);
                                	break; 
                                case SECURE_DATA_GET_DATA_STRING:
                                    SecureDataGetDataExecute(args, callbackContext);
                                    break;
                                case SECURE_DATA_GET_SEALED_DATA_STRING:
                                    SecureDataGetSealedDataExecute(args, callbackContext);
                                    break;
                                case SECURE_DATA_GET_TAG_STRING:
                                    SecureDataGetTagExecute(args, callbackContext);
                                    break;
                                case SECURE_DATA_GET_POLICY_STRING:
                                    SecureDataGetPolicyExecute(args, callbackContext);
                                    break;
                                case SECURE_DATA_GET_OWNERS_STRING:
                                    SecureDataGetOwnersExecute(args, callbackContext);
                                    break;
                                case SECURE_DATA_GET_CREATOR_STRING:
                                    SecureDataGetCreatorExecute(args, callbackContext);
                                    break;
                                case SECURE_DATA_DESTROY_STRING:
                                    SecureDataDestroyExecute(args, callbackContext);
                                    break;
                                // Secure Storage
                                case SECURE_STORAGE_READ_STRING:
                                    SecureStorageReadExecute(args, callbackContext);
                                    break;
                                case SECURE_STORAGE_WRITE_STRING:
                                    SecureStorageWriteExecute(args, callbackContext);
                                    break;
								case SECURE_STORAGE_WRITE_SECURE_DATA_STRING:
                                    SecureStorageWriteSecureDataExecute(args, callbackContext);
                                    break;
                                case SECURE_STORAGE_DELETE_STRING:
                                    SecureStorageDeleteExecute(args, callbackContext);
                                    break;
                            };
                        } catch (ErrorCodeException e){                            
                            callbackContext.error(e.getErrorCodeEnum().getErrorCode());
                        } catch (JSONException e){
                            callbackContext.error(ErrorCodeEnum.INTERNAL_ERROR_OCCURRED.getErrorCode());
                        } catch (OutOfMemoryError e){
                            callbackContext.error(ErrorCodeEnum.MEMORY_ALLOCATION_FAILURE.getErrorCode());
                        } catch (Exception e) {
                            callbackContext.error(ErrorCodeEnum.INTERNAL_ERROR_OCCURRED.getErrorCode());
                        }                        
                    }
                });
                return true;
            } 
            else 
            {
                // the action is not supported
                //throw new ErrorCodeException(ErrorCode.INTERNAL_ERROR_OCCURRED);
                return false;
            }                                                         
    }
    
    
    protected void SecureDataCreateFromDataExecute(final JSONArray args, final CallbackContext callbackContext) throws ErrorCodeException, JSONException, UnsupportedEncodingException {
        
        if (args.length() != 10) {
            throw new ErrorCodeException(ErrorCodeEnum.INTERNAL_ERROR_OCCURRED);
        }

        String dataStr = args.getString(0);
        String tagStr = args.getString(1);
        long extraKey = args.getLong(2);
        int appAccessControl = args.getInt(3);
        int deviceLocality = args.getInt(4);
        int sensitivityLevel = args.getInt(5);
        int noStore = args.getInt(6);
        int noRead = args.getInt(7);
        long creator = args.getLong(8);
        JSONArray ownersUIDJSONArray = args.getJSONArray(9);

        SecureData sData = new SecureData();                               
        long instanceID = sData.CreateFromDataAPI(dataStr, tagStr, extraKey, appAccessControl, deviceLocality, sensitivityLevel, noStore, noRead,
        		creator, ownersUIDJSONArray);

        // trying to clean plain text from memory
        dataStr = null;
        //args = null;
        callbackContext.success(Long.toString(instanceID));
    }
    
    protected void SecureDataCreateFromSealedDataExecute(final JSONArray args, final CallbackContext callbackContext) throws ErrorCodeException, JSONException {
        
        if (args.length() != 2) {
            throw new ErrorCodeException(ErrorCodeEnum.INTERNAL_ERROR_OCCURRED);
        }
        String sealedDataStr = args.getString(0);
        long extraKey = args.getLong(1);
        SecureData sData = new SecureData();
        long instanceID = sData.CreateFromSealedDataAPI(sealedDataStr, extraKey);
        callbackContext.success(Long.toString(instanceID));
    }
    
    protected void SecureDataChangeExtraKeyExecute(final JSONArray args, final CallbackContext callbackContext) throws ErrorCodeException, JSONException {
    	if (args.length() != 2) {
            throw new ErrorCodeException(ErrorCodeEnum.INTERNAL_ERROR_OCCURRED);
        }
    	 long instanceID = args.getLong(0);
         long extraKeyInstanceID = args.getLong(1);
         SecureData sData = new SecureData();
         sData.ChangeExtraKeyAPI(instanceID, extraKeyInstanceID);
         callbackContext.success();
    }
    protected void SecureDataGetDataExecute(final JSONArray args, final CallbackContext callbackContext) throws ErrorCodeException, JSONException, UnsupportedEncodingException {
        
        if (args.length() != 1) {
            throw new ErrorCodeException(ErrorCodeEnum.INTERNAL_ERROR_OCCURRED);
        }
        long instanceID = args.getLong(0);                                                                
        SecureData sData = new SecureData();
        String retStr = sData.GetDataAPI(instanceID);
        callbackContext.success(retStr);
    }
    
    protected void SecureDataGetSealedDataExecute(final JSONArray args, final CallbackContext callbackContext) throws ErrorCodeException, JSONException {
        
        if (args.length() != 1) {
            throw new ErrorCodeException(ErrorCodeEnum.INTERNAL_ERROR_OCCURRED);
        }
        long instanceID = args.getLong(0);
        SecureData sData = new SecureData();
        String retStr = sData.GetSealedDataAPI(instanceID);                                      
        callbackContext.success(retStr);
    }
    
    protected void SecureDataGetTagExecute(final JSONArray args, final CallbackContext callbackContext) throws ErrorCodeException, JSONException, UnsupportedEncodingException {
     
        if (args.length() != 1) {
            throw new ErrorCodeException(ErrorCodeEnum.INTERNAL_ERROR_OCCURRED);
        }
        long instanceID = args.getLong(0);
        SecureData sData = new SecureData();
        String retStr = sData.GetTagAPI(instanceID);
        callbackContext.success(retStr);
    }
    
    protected void SecureDataGetPolicyExecute(final JSONArray args, final CallbackContext callbackContext) throws ErrorCodeException, JSONException {
        
        
        if (args.length() != 1) {
            throw new ErrorCodeException(ErrorCodeEnum.INTERNAL_ERROR_OCCURRED);
        }
        long instanceID = args.getLong(0);
        SecureData sData = new SecureData();
        JSONObject jObj = sData.GetDataPolicyAPI(instanceID);
        callbackContext.success(jObj);
    }    
    
    protected void SecureDataGetOwnersExecute(final JSONArray args, final CallbackContext callbackContext) throws ErrorCodeException, JSONException {
        
        if (args.length() != 1) {
            throw new ErrorCodeException(ErrorCodeEnum.INTERNAL_ERROR_OCCURRED);
        }
        long instanceID = args.getLong(0);
        SecureData sData = new SecureData();
        JSONArray jObj = sData.GetOwnersAPI(instanceID);
        callbackContext.success(jObj);
    }
    
    protected void SecureDataGetCreatorExecute(final JSONArray args, final CallbackContext callbackContext) throws ErrorCodeException, JSONException {
     
        if (args.length() != 1) {
            throw new ErrorCodeException(ErrorCodeEnum.INTERNAL_ERROR_OCCURRED);
        }
        long instanceID = args.getLong(0);
        SecureData sData = new SecureData();
        long creator = sData.GetCreatorAPI(instanceID);
        callbackContext.success(Long.toString(creator));
    }

    
    protected void SecureDataDestroyExecute(final JSONArray args, final CallbackContext callbackContext) throws ErrorCodeException, JSONException {
        
        if (args.length() != 1) {
            throw new ErrorCodeException(ErrorCodeEnum.INTERNAL_ERROR_OCCURRED);
        }
        long instanceID = args.getLong(0);
        SecureData sData = new SecureData();
        sData.DestoryAPI(instanceID);                                      
        callbackContext.success();
    }
    
    protected void SecureStorageReadExecute(final JSONArray args, final CallbackContext callbackContext) throws ErrorCodeException, JSONException {
     
        if (args.length() != 3) {
            throw new ErrorCodeException(ErrorCodeEnum.INTERNAL_ERROR_OCCURRED);
        }
        String id = args.getString(0);
        int storageType = args.getInt(1);
        long extraKey = args.getLong(2);
        SecureStorage sStorage = new SecureStorage();
        long instanceID = sStorage.ReadAPI(id, storageType, extraKey);                
        callbackContext.success(Long.toString(instanceID));
    }
    
    protected void SecureStorageWriteExecute(final JSONArray args, final CallbackContext callbackContext) throws ErrorCodeException, JSONException, UnsupportedEncodingException {
        
        if (args.length() != 12) {
            throw new ErrorCodeException(ErrorCodeEnum.INTERNAL_ERROR_OCCURRED);
        }
		
        String id = args.getString(0);
        int storageType = args.getInt(1);
		String dataStr = args.getString(2);
        String tagStr = args.getString(3);
        long extraKey = args.getLong(4);
        int appAccessControl = args.getInt(5);
        int deviceLocality = args.getInt(6);
        int sensitivityLevel = args.getInt(7);
        int noStore = args.getInt(8);
        int noRead = args.getInt(9);
        long creator = args.getLong(10);
        JSONArray ownersUIDJSONArray = args.getJSONArray(11);
		
        SecureStorage sStorage = new SecureStorage();
        sStorage.WriteAPI(id, storageType, dataStr, tagStr, extraKey, appAccessControl, deviceLocality, sensitivityLevel, 
        		noStore, noRead, creator, ownersUIDJSONArray);
        callbackContext.success();
    }
	
	protected void SecureStorageWriteSecureDataExecute(final JSONArray args, final CallbackContext callbackContext) throws ErrorCodeException, JSONException {
        
        if (args.length() != 3) {
            throw new ErrorCodeException(ErrorCodeEnum.INTERNAL_ERROR_OCCURRED);
        }
        String id = args.getString(0);
        int storageType = args.getInt(1);
        long instanceID = args.getLong(2);
        SecureStorage sStorage = new SecureStorage();
        sStorage.WriteSecureDataAPI(id, storageType, instanceID);
        callbackContext.success();
    }
    
    protected void SecureStorageDeleteExecute(final JSONArray args, final CallbackContext callbackContext) throws ErrorCodeException, JSONException {
        
        if (args.length() != 2) {
            throw new ErrorCodeException(ErrorCodeEnum.INTERNAL_ERROR_OCCURRED);
        }
        String id = args.getString(0);
        int storageType = args.getInt(1);
        SecureStorage sStorage = new SecureStorage();
        sStorage.DeleteAPI(id, storageType);
        callbackContext.success();
    }
}

