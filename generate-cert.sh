#!/bin/bash

tlsSubject='/C=DE/ST=Bavaria/L=Roettenbach/O=SEAL Systems AG/OU=COM/CN=localhost'
cert='keys/localhost.selfsigned/cert.pem'
key='keys/localhost.selfsigned/key.pem'
combined='keys/localhost.selfsigned/cert-key-combined.pem'
keyPk8='keys/localhost.selfsigned/key-pk8.pem'

# generate
openssl req -subj "${tlsSubject}" -nodes -x509 -newkey rsa:2048 -keyout ${key} -out ${cert} -days 3650
cat ${cert} > ${combined}
cat ${key} >> ${combined}

openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in ${key} -out ${keyPk8}

# show
openssl x509 -in keys/localhost.selfsigned/cert.pem -text -noout