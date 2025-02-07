#!/bin/sh

echo "window.__ENV__ = {" > /usr/src/app/public/runtime-config.js

for var in $(env | grep NEXT_PUBLIC_ | awk -F= '{print $1}'); do
    echo "  \"$var\": \"$(eval echo \$$var)\"," >> /usr/src/app/public/runtime-config.js
done

echo "};" >> /usr/src/app/public/runtime-config.js

exec npm start
