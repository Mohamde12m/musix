#!/bin/bash
cd /home/z/my-project
# اقتل أي خادم سابق
pkill -9 -f "next dev" 2>/dev/null
sleep 2
# ابدأ الخادم مع بقاء دائم
exec npx next dev -p 3000 2>&1 | tee dev.log
