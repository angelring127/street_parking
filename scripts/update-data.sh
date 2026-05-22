#!/bin/bash

# Vancouver Open Data Portal から駐車メーター GeoJSON データをダウンロード
# Download parking meter GeoJSON data from Vancouver Open Data Portal

echo "🚀 Downloading parking meter data from Vancouver Open Data Portal..."

data_file="parking-meters.geojson"
tmp_file="${data_file}.tmp"

# データダウンロード
curl -fL -o "$tmp_file" \
  "https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/parking-meters/exports/geojson?timezone=America%2FLos_Angeles"

if [ $? -eq 0 ]; then
    mv "$tmp_file" "$data_file"
    echo "✅ Data download completed successfully!"

    # ファイルサイズ確認
    file_size=$(wc -c < "$data_file")
    echo "📊 File size: $file_size bytes"

    # レコード数確認 (簡易チェック)
    record_count=$(node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync('$data_file','utf8')); console.log((data.features || []).length)")
    echo "📍 Number of parking meters: $record_count"
else
    rm -f "$tmp_file"
    echo "❌ Data download failed!"
    exit 1
fi
