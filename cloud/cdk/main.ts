#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { MainStack } from './main-stack';

function prettyError(s: string) {
  console.error(`\x1b[41m${s}\x1b[0m`)
}

const app = new cdk.App();
if (!process.env.ENVIRONMENT || (process.env.ENVIRONMENT != "sandbox" && process.env.ENVIRONMENT != "production") ) {
  prettyError(" ❌ Environment improperly set. Please set env var ENVIRONMENT to either 'sandbox' or 'production'.")
  process.exit(1)
}

new MainStack(app, 'IPOWarningCdkStack', {
  environment: process.env.ENVIRONMENT
});