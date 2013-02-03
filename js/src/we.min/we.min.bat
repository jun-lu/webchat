@echo off
set inputlist=%inputlist% --js we.js
set inputlist=%inputlist% --js we.kit.dragelement.js
set inputlist=%inputlist% --js we.kit.textarea.js

echo we.js
echo we.kit.dragelement.js
echo we.kit.textarea.js

set outputfilename= ..\..\we.min.js

echo to we.min.js

java -jar ..\compiler.jar %inputlist% --js_output_file %outputfilename%
echo %outputfilename%
@pause>nul