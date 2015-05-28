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

var fs = require('fs');
var archName=null;
 
function help() {
	console.log('you need to specify architecture (x86, x64 or arm)');
	console.log('Example: node ChooseArch_Windows.js x86');	
	exit(1);
}
if(process.argv.length<3) {
	help();
}

//Checks if architecture was provided
if((process.argv[2].toLowerCase()!='arm') &&(process.argv[2].toLowerCase()!='x86')&&(process.argv[2].toLowerCase()!='x64') ) {
	console.log("No valid architecture was provided.");	
	help();
} else {
	archName=process.argv[2];
}


copyFilesIntoProject();
// fix windows8:
var projectFile = 'CordovaApp.Windows80.jsproj';
var solutionFile = 'CordovaApp.vs2012.sln';
defineArchSLN(solutionFile);
fixProjFile(projectFile);
// fix windows8.1
projectFile = 'CordovaApp.Windows.jsproj';
solutionFile = 'CordovaApp.sln';
defineArchSLN(solutionFile);
fixProjFile(projectFile);
console.log("Fixed!");	

function copyFilesIntoProject(){
	// copy dll & winmd & files
	// and for Intel platform copy the .vp and .sb	
	var srcPath = '../../plugins/com.intel.security/src/windows8/libs/'+archName+'/';
	var dstPath = 'plugins/com.intel.security/';
	var dllFilesName = ['IntelSecurityServicesWRC.dll', 'IntelSecurityServicesWRC.winmd'];
	var intelFilesName = ['IntelSecurityServicesWRC.sb', 'sr_agent.vp'];
	
	for (var i =0; i < dllFilesName.length;i++){
		var file = dllFilesName[i];
		//console.log('file ===== '+file);
		copyFile(srcPath+file, dstPath+file);
	}
	
	if ((archName == 'x86') ||(archName == 'x64')){
		for (var i =0; i < intelFilesName.length;i++){
			var file = intelFilesName[i];
			copyFile(srcPath+file, dstPath+file);
		}
	}
}


function copyFile(sourceFile, targetFile) {
	//console.log('copyFile: sourceFile = '+sourceFile+', targetFile = '+targetFile);
	if (fs.existsSync(sourceFile)) {
		if(fs.existsSync(targetFile)) {
			//console.log("removing old "+targetFile);
			fs.unlinkSync(targetFile);
		}
		//console.log("copying "+sourceFile+" to "+targetFile);
		fs.createReadStream(sourceFile).pipe(fs.createWriteStream(targetFile));
	} else  {
		console.log('error:, '+sourceFile+' does not exist. Exiting');
		process.exit(1);
	}
}


function defineArchSLN(fileName) {
	//console.log("defineArchSLN: file= "+fileName);
	fs.readFile(fileName,'utf8', 	
		function (err, data) {
			//console.log("Fixing "+fileName+" file");
			if (!err) {			
				//console.log("Fixing "+fileName+" file");
				var newData=data.replace(/({[\dA-F\-]*}.(Debug|Release)\|.*\s=\s(Debug|Release))\|Any CPU/g,"$1|"+archName);
				fs.writeFileSync(fileName, newData);
			}
		});
}

function defineArchProject(fileName) {
	//console.log("defineArchProject: file= "+fileName);
	// open project file for defining the architecture
	fs.readFile(fileName,'utf8', 
		function (err, data) {
			if (!err) {			
				//console.log("Fixing "+fileName+" file");
				var newData=data.replace('<Platform Condition= $(Platform) == >AnyCPU</Platform>','<Platform Condition= $(Platform) ==  >'+archName+'<//Platform>');
				newData=newData.replace(/Bin\\(x86|x64|ARM)\\/g,'Bin\\');
				
				newData=newData.replace('<Platform>AnyCPU</Platform>','<Platform>'+archName+'</Platform>');
				fs.writeFileSync(fileName, newData);
			}
		});
}

function fixProjFile(fileName) {
	fs.readFile(fileName,'utf8', 
		function (err, data) {            
			if (!err) {			
				if (data.indexOf('IntelSecurityServicesWRC.sb') == -1) {
				    //console.log("Fixing resources");
				    var newData=data.replace(
					    "</ItemGroup>",
					    '</ItemGroup>\n\t<ItemGroup Condition="$(Platform)==\'x86\' or $(Platform)==\'x64\'" >\n\t\t<Content Include="plugins\\com.intel.security\\IntelSecurityServicesWRC.sb" />\n\t\t<Content Include="plugins\\com.intel.security\\sr_agent.vp" />\n\t</ItemGroup>'
				    );
				    fs.writeFileSync(fileName, newData);
				}
			} else {
				console.log('error in fixProjFile');                
			}
		});
}


