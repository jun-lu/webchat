#!/bin/sh
inputlist=$inputlist\ \-\-js\ we.create/we.create.js
echo we.create/we.create.js


outputfilename=\ ../we.create.min.js

echo to $outputfilename
echo $inputlist
java -jar ../compiler.jar $inputlist --js_output_file $outputfilename
echo $outputfilename
