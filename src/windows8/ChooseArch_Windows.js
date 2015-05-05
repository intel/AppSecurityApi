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
var platform=null;
var archName=null;
var projectFile=null;
var solutionFile=null;
 

if(process.argv.length<6)
{
	console.log("you need to specify OS, architecture, project file name & solution file name");
	process.exit(1);
}

//Checks if OS is windows8 or windows  which is windows8.1 and windows phone8.1
var tempOS=process.argv[2].toLowerCase();
if( (tempOS=='windows8') || (tempOS=='windows') )
{
	platform=tempOS;
}
//Case the OS is Windows Phone 8
else if( (tempOS=='wp') || (tempOS=='wp8') )
	{
		platform='wp';
	}
	else
	{
		console.log("No valid OS provided.");
		process.exit(1);
	}


//Checks if architecture was provided
if((process.argv[3].toLowerCase()!='arm') &&(process.argv[3].toLowerCase()!='x86')&&(process.argv[3].toLowerCase()!='x64') )
{
	console.log("No valid architecture was provided.");
	process.exit(1);
}
else
{
	archName=process.argv[3];
}

//Checks if project file was provided (.jsproj)
if( ((process.argv[4].indexOf(".jsproj"))==-1) && ((process.argv[4].indexOf(".csproj"))==-1) )
{
	console.log("No project file (.jsproj or .csproj) was provided.");
	process.exit(1);
}
else
{
	projectFile=process.argv[4];
}

//Checks if solution file was selected (.sln)
if((process.argv[5].indexOf(".sln"))==-1 )
{
	console.log("No solution file (.sln) was provided.");
	process.exit(1);
}
else
{
	solutionFile=process.argv[5];
}

copyFiles();
defineArchSLN(solutionFile);
fixProjFile(projectFile);
setTargetPlatform();

var projitemsFile = 'CordovaApp.projitems';
fixProjitemsFile(projitemsFile);		

//Copies the suitable dll & winmd files
function copyFiles()
{
	var OSDirectory="";
	if(platform=='windows' || platform=='windows8')
	{
		OSDirectory='windows8';
	}
	if(platform=='wp8')
	{
		OSDirectory='wp8';
	}
	var sourceFile='../../plugins/com.intel.security/src/'+OSDirectory+'/libs/'+archName+'/IntelSecurityServicesWRC.dll';
	var targetFile=null;
	if(platform=='windows8')
	{
		targetFile='plugins/com.intel.security/IntelSecurityServicesWRC.dll';
	}
	if(platform=='windows')
	{
		targetFile='plugins/com.intel.security/IntelSecurityServicesWRC.dll';
	}
	if(platform=='wp')
	{
		targetFile='../wp8/plugins/com.intel.security/IntelSecurityServicesWRC.dll';
	}
	if (fs.existsSync(sourceFile))
	{
		if(fs.existsSync(targetFile))
		{
			console.log("Removing old IntelSecurityServicesWRC.dll");
			fs.unlinkSync(targetFile);
		}
		console.log("Copying dll file for architecture: "+archName);
		fs.createReadStream(sourceFile).pipe(fs.createWriteStream(targetFile));
	}
	else 
	{
		console.log("IntelSecurityServicesWRC.dll does not exist. Exiting");
		process.exit(1);
	}
	
	sourceFile='../../plugins/com.intel.security/src/'+OSDirectory+'/libs/'+archName+'/IntelSecurityServicesWRC.winmd';
	targetFile=null;
	
	if(platform=='windows8')
	{
		targetFile='plugins/com.intel.security/IntelSecurityServicesWRC.winmd';
	}
	if(platform=='windows')
	{
		targetFile='plugins/com.intel.security/IntelSecurityServicesWRC.winmd';
	}
	if(platform=='wp')
	{
		targetFile='../wp8/plugins/com.intel.security/IntelSecurityServicesWRC.winmd';
	}
	if (fs.existsSync(sourceFile))
	{
		if(fs.existsSync(targetFile))
		{
			console.log("Removing old IntelSecurityServicesWRC.winmd");
			fs.unlinkSync(targetFile);
		}
		console.log("Copying winmd file for architecture: "+archName);
		fs.createReadStream(sourceFile).pipe(fs.createWriteStream(targetFile));
		
	}
	else 
	{
		console.log("IntelSecurityServicesWRC.winmd does not exist. Exiting");
		process.exit(1);
	}
    
	
    if ((archName == 'x86') ||(archName == 'x64')){
        sourceFile='../../plugins/com.intel.security/src/'+platform+'/libs/'+archName+'/IntelSecurityServicesWRC.sb';
        targetFile=null;
        if(platform=='windows8')
        {
            targetFile='plugins/com.intel.security/IntelSecurityServicesWRC.sb';
        }
 
        if (fs.existsSync(sourceFile))
        {
            if(fs.existsSync(targetFile))
            {
                console.log("Removing old IntelSecurityServicesWRC.sb");
                fs.unlinkSync(targetFile);
            }
            console.log("Copying IntelSecurityServicesWRC.sb file for architecture: "+archName);
            fs.createReadStream(sourceFile).pipe(fs.createWriteStream(targetFile));
            
        }
        else 
        {
            console.log("IntelSecurityServicesWRC.sb does not exist. Exiting");
            process.exit(1);
        }
        
        sourceFile='../../plugins/com.intel.security/src/'+platform+'/libs/'+archName+'/sr_agent.vp';
        targetFile=null;
        if(platform=='windows8')
        {
            targetFile='plugins/com.intel.security/sr_agent.vp';
        }
 
        if (fs.existsSync(sourceFile))
        {
            if(fs.existsSync(targetFile))
            {
                console.log("Removing old sr_agent.vp");
                fs.unlinkSync(targetFile);
            }
            console.log("Copying sr_agent.vp file for architecture: "+archName);
            fs.createReadStream(sourceFile).pipe(fs.createWriteStream(targetFile));
            
        }
        else 
        {
            console.log("sr_agent.vp does not exist. Exiting");
            process.exit(1);
        }
    
    }
    
    
}


function defineArchSLN(fileName)
{
	//Opens project file for defining the architecture
	fs.readFile(fileName,'utf8', 
		function (err, data)
		{
			if (!err)
			{			
				console.log("Fixing "+fileName+" file");
				var newData=data.replace(/({[\dA-F\-]*}.(Debug|Release)\|.*\s=\s(Debug|Release))\|Any CPU/g,"$1|"+archName);
				fs.writeFileSync(fileName, newData);
			}
		});
}

function defineArchProject(fileName)
{
	//Opens project file for defining the architecture
	fs.readFile(fileName,'utf8', 
		function (err, data)
		{
			if (!err)
			{			
				console.log("Fixing "+fileName+" file");
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
                if (data.indexOf('IntelSecurityServicesWRC.sb') == -1)
                {
                    console.log("Fixing resources");
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

function fixDLLResourceIssue(fileName)
{
	//Opens project file for fixing the dll reference
	fs.readFile(fileName,'utf8', 
		function (err, data)
		{
			if (!err)
			{			
				console.log("Fixing dll resource issue");
				var newData=null;
				if(platform=='windows8')
				{
					newData=data.replace('Content Include="plugins\\com.intel.security\\IntelSecurityServicesWRC.dll"','PRIResource Include="plugins\\com.intel.security\\IntelSecurityServicesWRC.dll"');
				}
				if(platform=='wp')
				{
					newData=data.replace('Content Include="Plugins\\com.intel.security\\IntelSecurityServicesWRC.dll"','Resource Include="Plugins\\com.intel.security\\IntelSecurityServicesWRC.dll"');
				}
				fs.writeFileSync(fileName, newData);
				if(platform=='wp')
				{
					defineArchProject(fileName);
				}
                
                
			}
		});
}

function setTargetPlatform()
{
	//Opens project file for fixing the dll reference
	var platfromConfigFileName='config.xml';
	var genericConfigFileName='../../'+platfromConfigFileName;
	fs.readFile(platfromConfigFileName,'utf8', 
		function (err, data)
		{
			if (!err)
			{			
				console.log("Setting the correct platform to config.xml in platform directory");
				var newData=null;
				if(platform=='windows')
				{
					newData=data.replace('"windows-target-version" value="8.0"','"windows-target-version" value="8.1"');
				}
				if(platform=='windows8')
				{
					newData=data.replace('"windows-target-version" value="8.1"','"windows-target-version" value="8.0"');
					}
				fs.writeFileSync(platfromConfigFileName, newData);
			}
		});
		
		fs.readFile(genericConfigFileName,'utf8', 
		function (err, data)
		{
			if (!err)
			{			
				console.log("Setting the correct platform to config.xml in root directory");
				var newData=null;
				if(platform=='windows')
				{
					newData=data.replace('"windows-target-version" value="8.0"','"windows-target-version" value="8.1"');
				}
				if(platform=='windows8')
				{
					newData=data.replace('"windows-target-version" value="8.1"','"windows-target-version" value="8.0"');
					}
				fs.writeFileSync(genericConfigFileName, newData);
			}
		});
}


function fixProjitemsFile(fileName) {

	fs.readFile(fileName,'utf8', 
		function (err, data) {
			if (!err) {			
				var newData=data.replace(
                        "<Content Include=\"plugins\\com.intel.security\\IntelSecurityServicesWRC.dll\" />",
                    "");                    
				fs.writeFileSync(fileName, newData);
			} else {
                console.log('error in fixProjitemsFile');                
            }
		});
}
