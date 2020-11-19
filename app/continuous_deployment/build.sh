#!/bin/bash
set -ev
#run only on master
CI=false
npm run build
CI=true