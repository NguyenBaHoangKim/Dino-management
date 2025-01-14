#!/usr/bin/env -S node --env-file=.env --require=./src/lib/tracing.cjs
import main from '../src/main.js'

await main()