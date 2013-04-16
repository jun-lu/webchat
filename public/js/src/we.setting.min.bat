@echo off
set inputlist=%inputlist% --js we.setting\we.api.setting.js
set inputlist=%inputlist% --js we.setting\we.page.setting.js



set outputfilename= --js_output_file ..\we.setting.min.js
echo %inputlist%
echo %outputfilename%

java -jar compiler.jar %inputlist% %outputfilename%
echo  %outputfilename%
@pause>nul