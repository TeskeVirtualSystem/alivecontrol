#!/usr/bin/env bash

LOCKFILE=/tmp/smartmon
if [ -e ${LOCKFILE} ] && kill -0 `cat ${LOCKFILE}`
then
        echo "Já rodando!"
        exit
fi

trap "rm -f ${LOCKFILE}; exit" INT TERM EXIT
echo $$ > ${LOCKFILE}

cd /root/ac
node smart_monitor.js 2> lastlog 1> lastlog

