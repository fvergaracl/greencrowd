
echo "Generando runtime-config.js con variables de entorno..."

CONFIG_FILE="/usr/src/app/public/runtime-config.js"

echo "window.__ENV__ = {" > $CONFIG_FILE

# Buscar todas las variables de entorno que comienzan con NEXT_PUBLIC_
for var in $(env | grep NEXT_PUBLIC_ | awk -F= '{print $1}'); do
    echo "  \"$var\": \"$(eval echo \$$var)\"," >> $CONFIG_FILE
done

echo "};" >> $CONFIG_FILE

echo "Archivo runtime-config.js generado:"
cat $CONFIG_FILE

exec npm start
