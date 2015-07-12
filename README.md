App Security Api Cordova Plugin
===============================
The plugin enables the use of security properties and capabilities on the platform, using a new set of API defined for application developers.
You are not required to be a security expert to make good use of the API and plugin. Key elements, such as encryption of data and establishments of capabilities, is abstracted and done by the plugin, for you.
For example
-	Use the plugin to store (E.g. cache) data locally, using the device non-volatile storage. Data protection/encryption will be done for you by the plugin
-	Establish a connection with remote server (E.g. XHR) using a protected channel. SSL/TLS establishment and usage will be done for you by the plugin
For more information please visit our API documentation @ https://software.intel.com/en-us/app-security-api/api

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
		cordova build 

	8. (Optional) Run the project
		cordova emulate	(SDK emulator)
		-or-
		cordova run (connected device)

Cordova 3.5.0 windows 8 build flow
    To overcome some gaps/issues with native library build in Windows 8 we
	 provide a workaround script (ChooseArch_*.js) that you should use before
	 step 7 (build the project).
    Copy the script from platforms\windows8\plugins\com.intel.security to
	 platforms\windows8 and run it from platforms\windows8 directory.
	Run the following command in a shell:
	  node.exe ChooseArch_Win8.js <os> <arch> <projectFile> <solutionFile>
      Options: 
		arch : x86/x64/Arm
		os : windows8 only
	   (i.e. node.exe ChooseArch_Win8.js windows8 x64 CordovaApp.jsproj CordovaApp.sln)

Cordova 4.1.2/5.1.1 windows build flow
    To overcome some gaps/issues with native library build in Windows 8 we
	 provide a workaround script (ChooseArch_*.js) that you should use before
	 step 7 (build the project).
    Copy the script from platforms\windows8\plugins\com.intel.security to
	 platforms\windows8 and run it from platforms\windows8 directory.
	Run the following command in a shell:
	  node.exe ChooseArch_Windows.js <arch>
	  Options: 
		arch : x86/x64/Arm
       (i.e. node.exe ChooseArch_Windows.js x64)

	Note: To build the Cordova app you need to use 'cordova build --arch <arch>
	 (I.e. cordova build --arch x64)
