@echo off
set inputlist=%inputlist% --js we.chat\we.api.chat.js
set inputlist=%inputlist% --js we.chat\we.box.chat.js




set outputfilename= --js_output_file ..\we.box.chat.min.js
echo %inputlist%
echo %outputfilename%

java -jar compiler.jar %inputlist% %outputfilename%
echo 文件已输出到 %outputfilename%
@pause>nul