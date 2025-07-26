#!/bin/bash
# Load environment variables from .env and run the enrichment queue test

set -a
source .env
set +a

npx ts-node src/jobs/enrichmentQueueTest.ts
