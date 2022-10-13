#!/usr/bin/env bash

vault read -format json secret/suitable/beehive/local/github-oauth | 
  jq -r  '.data | to_entries[] | "GITHUB_\(.key | ascii_upcase)=\(.value)"' > .env

echo "COOKIE_SIGNING_SECRET=$(echo $RANDOM | md5sum | head -c 20)" >> .env

echo "SELF_HOST=localhost:3000" >> .env
