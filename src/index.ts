#!/usr/bin/env node

import { runCli } from "./cli";

// Entry point for the compiled CLI. Delegates to cli.ts, which sets up Commander.
runCli();
