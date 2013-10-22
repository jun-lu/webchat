#!/bin/sh
inputlist=$inputlist\ \-\-js\ we.top/we.top.js
echo we.chat/we.top.js


outputfilename=\ ../we.top.min.js

echo to $outputfilename
echo $inputlist
java -jar ../compiler.jar $inputlist --js_output_file $outputfilename
echo $outputfilename
