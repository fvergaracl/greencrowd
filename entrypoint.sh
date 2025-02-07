#!/bin/sh

CONFIG_FILE="/usr/src/app/public/runtime-config.js"

echo "Generando runtime-config.js con variables de entorno..."

# Reemplaza el archivo con una nueva versión
echo "window.__ENV__ = {" > $CONFIG_FILE

# Buscar todas las variables de entorno que comienzan con NEXT_PUBLIC_
for var in $(env | grep NEXT_PUBLIC_ | awk -F= '{print $1}'); do
    value=$(eval echo \$$var)
    echo "  \"$var\": \"$value\"," >> $CONFIG_FILE
done

# Cerrar el JSON
echo "};" >> $CONFIG_FILE

echo "Archivo runtime-config.js generado:"
cat $CONFIG_FILE

# Esperar para asegurarse de que el archivo se haya escrito correctamente
sleep 1

# Iniciar Next.js
exec npm start
