#!/bin/sh
inputlist=$inputlist\ \-\-js\ we.user/we.page.user.js
echo we.user/we.page.user.js


outputfilename=\ ../we.user.min.js

echo to $outputfilename
echo $inputlist
java -jar compiler.jar $inputlist --js_output_file $outputfilename
echo $outputfilename
