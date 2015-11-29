App Security Api Cordova Plugin
===============================
The plugin enables the use of security properties and capabilities on the platform, using a new set of API defined for application developers.
You are not required to be a security expert to make good use of the API and plugin. Key elements, such as encryption of data and establishments of capabilities, is abstracted and done by the plugin, for you.
For example
-	Use the plugin to store (E.g. cache) data locally, using the device non-volatile storage. Data protection/encryption will be done for you by the plugin
-	Establish a connection with remote server (E.g. XHR) using a protected channel. SSL/TLS establishment and usage will be done for you by the plugin

For more information please visit our API documentation @ https://software.intel.com/en-us/app-security-api/api
Additionally please see our demo application "MyPrivateNotes" https://software.intel.com/en-us/xdk/article/my-private-notes-sample

How to use the plugin
=====================
This example is for Android but applicable for iOS and Windows
	1. Create a new Cordova project
		Cordova create AppDir com.intel.security AppDir

	2. Navigate to the Cordova project directory
		cd AppDir

	3. Add android to the project
		cordova platform add android

	4. (Optional) Verify that Android was added correctly
		cordova platform

	5. Add the plugin to the project (use a local copy)
		cordova plugin add /PATH/TO/YOUR/LOCAL/COPY

	6. (Optional) Verify that the plugin was added correctly 
		cordova plugin

    7. Build the project
		(Optional) for windows build instructions please see below
		Cordova build 

	8. (Optional) Run the project
		cordova emulate	(SDK emulator)
		-or-
		cordova run (connected device)

Cordova 5.1.1 Windows build flow
    To overcome some gaps/issues with native library build in Windows we
	provide a workaround script (ChooseArch_Windows.js) that you should use before
	step 7 (build the project).
    Copy the script from plugins\com.intel.security\src\windows to
	platforms\windows and run it from platforms\windows directory.
	Run the following command in a shell:
		node.exe ChooseArch_Windows.js 
	
    To build the Windows project per architecture please use the following commands:	
    Windows 8:
	Assuming MSBuild is at "c:\Windows\Microsoft.NET\Framework\v4.0.30319\"
        c:\Windows\Microsoft.NET\Framework\v4.0.30319\MSBuild CordovaApp.Windows80.jsproj /p:Platform=x86 /p:Configuration=Release /t:rebuild  
        c:\Windows\Microsoft.NET\Framework\v4.0.30319\MSBuild CordovaApp.Windows80.jsproj /p:Platform=x64 /p:Configuration=Release /t:rebuild 
        c:\Windows\Microsoft.NET\Framework\v4.0.30319\MSBuild CordovaApp.Windows80.jsproj /p:Platform=ARM /p:Configuration=Release /t:rebuild 
    Windows 8.1:
        cordova compile windows --release --arch=x86 -- --win
        cordova compile windows --release --arch=x64 -- --win
        cordova compile windows --release --arch=ARM -- --win
    Windows 10:
        cordova compile windows --release --arch=x86 -- --appx=uap
        cordova compile windows --release --arch=x64 -- --appx=uap
        cordova compile windows --release --arch=ARM -- --appx=uap


