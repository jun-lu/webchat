@echo off
set inputlist=%inputlist% --js we.chat\we.page.chat.js



set outputfilename= --js_output_file ..\we.chat.min.js
echo %inputlist%
echo %outputfilename%

java -jar compiler.jar %inputlist% %outputfilename%
echo 文件已输出到 %outputfilename%
@pause>nul