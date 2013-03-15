#!/bin/sh
inputlist=$inputlist\ \-\-js\ we.chat/we.api.chat.js
inputlist=$inputlist\ \-\-js\ we.chat/we.page.chat.js
echo we.chat/we.api.chat.js
echo we.chat/we.page.chat.js


outputfilename=\ ../we.chat.min.js

echo to $outputfilename
echo $inputlist
java -jar compiler.jar $inputlist --js_output_file $outputfilename
echo $outputfilename
