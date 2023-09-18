#!/usr/bin/env bash

vault read -format json secret/suitable/beehive/local/github-oauth | 
  jq -r  '.data | to_entries[] | "GITHUB_\(.key | ascii_upcase)=\(.value)"' > .env

echo "COOKIE_SIGNING_SECRET=$(echo $RANDOM | md5sum | head -c 20)" >> .env

echo "PAGERDUTY_APP_ID=P2DQ0G3" >> .env
echo "SLACK_WORKSPACE_ID=T0CMFS7GX" >> .env
