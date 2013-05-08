@echo off
set inputlist=%inputlist% --js we.top\we.page.top.js



set outputfilename= --js_output_file ..\we.top.min.js
echo %inputlist%
echo %outputfilename%

java -jar compiler.jar %inputlist% %outputfilename%
echo 文件已输出到 %outputfilename%
@pause>nul