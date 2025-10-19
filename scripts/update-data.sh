#!/bin/bash

# Vancouver Open Data Portal から駐車メーターデータをダウンロード
# Download parking meter data from Vancouver Open Data Portal

echo "🚀 Downloading parking meter data from Vancouver Open Data Portal..."

# データディレクトリ作成 (存在しない場合)
mkdir -p public/data

# データダウンロード
curl -o public/data/parking-meters.json \
  "https://opendata.vancouver.ca/api/explore/v2.1/catalog/datasets/parking-meters/exports/json?limit=-1&timezone=America%2FLos_Angeles"

if [ $? -eq 0 ]; then
    echo "✅ Data download completed successfully!"
    
    # ファイルサイズ確認
    file_size=$(wc -c < public/data/parking-meters.json)
    echo "📊 File size: $file_size bytes"
    
    # レコード数確認 (簡易チェック)
    record_count=$(grep -o '"meterid"' public/data/parking-meters.json | wc -l)
    echo "📍 Number of parking meters: $record_count"
else
    echo "❌ Data download failed!"
    exit 1
fi

