#!/bin/sh
inputlist=$inputlist\ \-\-js\ chat.js
echo chat.js


outputfilename=\ chat.min.js

echo to $outputfilename
echo $inputlist
java -jar .\/src\/compiler.jar $inputlist --js_output_file $outputfilename
echo $outputfilename
