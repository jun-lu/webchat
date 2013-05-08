@echo off
set inputlist=%inputlist% --js we.min\we.js
set inputlist=%inputlist% --js we.min\we.kit.js
set inputlist=%inputlist% --js we.min\we.ui.tips.js
set inputlist=%inputlist% --js we.min\we.markdown.js
set inputlist=%inputlist% --js we.ui\we.dialog.js




set outputfilename= --js_output_file ..\we.min.js
echo %inputlist%
echo %outputfilename%

java -jar compiler.jar %inputlist% %outputfilename%
echo 文件已输出到 %outputfilename%
@pause>nul