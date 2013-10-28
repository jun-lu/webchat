@echo off
set inputlist=%inputlist% --js we.create\we.create.js



set outputfilename= --js_output_file ..\we.create.min.js
echo %inputlist%
echo %outputfilename%

java -jar compiler.jar %inputlist% %outputfilename%
echo success %outputfilename%
@pause>nul