#!/bin/sh
inputlist=$inputlist\ \-\-js\ we.min/we.js
inputlist=$inputlist\ \-\-js\ we.min/we.kit.js
inputlist=$inputlist\ \-\-js\ we.min/we.ui.tips.js

inputlist=$inputlist\ \-\-js\ we.ui/we.dialog.js
echo we.js
echo we.kit.js
echo we.kit.dragelement.js
echo we.kit.textarea.js
echo we.ui.stip.js

echo we.at.js
echo we.dialog.js

outputfilename=\ ../we.min.js

echo to $outputfilename
echo $inputlist
java -jar compiler.jar $inputlist --js_output_file $outputfilename
echo $outputfilename
