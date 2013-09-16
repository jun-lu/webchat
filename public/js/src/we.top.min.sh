#!/bin/sh
inputlist=$inputlist\ \-\-js\ we.top/we.page.top.js
echo we.top/we.page.top.js


outputfilename=\ ../we.top.min.js

echo to $outputfilename
echo $inputlist
java -jar compiler.jar $inputlist --js_output_file $outputfilename
echo $outputfilename
