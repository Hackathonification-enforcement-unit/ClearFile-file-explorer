#!/bin/bashs

mkdir -p dist/zip

for file in "./dist/ClearFile file explorer/*"
do
    filename=$(basename "$file")
    zip_file="./dist/zip/${filename%.*}.zip"

    zip "$zip_file" "$file" "./dist/ClearFile file explorer/resources.neu"
done;