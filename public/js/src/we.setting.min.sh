#!/bin/sh
inputlist=$inputlist\ \-\-js\ we.setting/we.page.setting.js

inputlist=$inputlist\ \-\-js\ ../we.setting.min.js
echo we.api.setting.js
echo we.page.setting.js

outputfilename=\ ../we.setting.min.js

echo to $outputfilename
echo $inputlist
java -jar compiler.jar $inputlist --js_output_file $outputfilename
echo $outputfilename
