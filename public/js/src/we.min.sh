#!/bin/sh
inputlist=$inputlist\ \-\-js\ we.min/we.js
inputlist=$inputlist\ \-\-js\ we.min/we.kit.js
inputlist=$inputlist\ \-\-js\ we.min/we.ui.tips.js
inputlist=$inputlist\ \-\-js\ we.min/we.cookie.js
inputlist=$inputlist\ \-\-js\ we.min/we.markdown.js

inputlist=$inputlist\ \-\-js\ we.ui/we.dialog.js


inputlist=$inputlist\ \-\-js\ we.api/we.api.room.js
inputlist=$inputlist\ \-\-js\ we.api/we.api.notice.js
inputlist=$inputlist\ \-\-js\ we.api/we.api.user.js

echo we.js
echo we.kit.js
echo we.markdown.js
echo we.dialog.js

outputfilename=\ ../lib/we.min.js

echo to $outputfilename
echo $inputlist
java -jar compiler.jar $inputlist --js_output_file $outputfilename
echo $outputfilename
