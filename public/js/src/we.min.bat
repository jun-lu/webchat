@echo off
set inputlist=%inputlist% --js we.min/we.js
set inputlist=%inputlist% --js we.min/we.kit.js
set inputlist=%inputlist% --js we.min/we.kit.dragelement.js
set inputlist=%inputlist% --js we.min/we.kit.textarea.js
set inputlist=%inputlist% --js we.min/we.ui.tips.js

set inputlist=%inputlist% --js we.ui/we.at.js
set inputlist=%inputlist% --js we.ui/we.dialog.js

echo we.js
echo we.kit.js
echo we.kit.dragelement.js
echo we.kit.textarea.js
echo we.ui.stip.js

echo we.at.js
echo we.dialog.js

set outputfilename= ..\we.min.js

echo to we.min.js

java -jar compiler.jar %inputlist% --js_output_file %outputfilename%
echo %outputfilename%
@pause>nul