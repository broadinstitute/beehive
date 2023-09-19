#!/usr/bin/env bash

vault read -format json secret/suitable/beehive/local/github-oauth | 
  jq -r  '.data | to_entries[] | "GITHUB_\(.key | ascii_upcase)=\(.value)"' > .env

# Pact credentials & configurations
echo "PACT_PASSWORD=$(vault read -format json 'secret/dsp/pact-broker/users/readwrite' | jq -r .data.basic_auth_password)" >> .env
echo "PACT_USERNAME=$(vault read -format json 'secret/dsp/pact-broker/users/readwrite' | jq -r .data.basic_auth_username)" >> .env
echo "PACTBASEURL=https://pact-broker.dsp-eng-tools.broadinstitute.org" >> .env

echo "COOKIE_SIGNING_SECRET=$(echo $RANDOM | md5sum | head -c 20)" >> .env

echo "PAGERDUTY_APP_ID=P2DQ0G3" >> .env
