#!/usr/bin/env bash

LOCKFILE=/tmp/smartmon
LOGFILE=/var/log/alivecontrol.log

if [ -e ${LOCKFILE} ] && kill -0 `cat ${LOCKFILE}`
then
  echo "Já rodando!"
  exit
fi

trap "rm -f ${LOCKFILE}; exit" INT TERM EXIT
echo $$ > ${LOCKFILE}

export NODE_PATH=/usr/local/alivecontrol:/etc/alivecontrol/
/usr/bin/nodejs /usr/local/alivecontrol/smart_monitor.js 2> $LOGFILE 1> $LOGFILE
