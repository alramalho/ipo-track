import * as cdk from '@aws-cdk/core';
import {DbStack} from "./db-stack";
import {ApiStack} from "./api-stack";

interface MainStackProps {
  environment: string
  dataApiUrl: string
}

export class MainStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props: MainStackProps) {
    super(scope, id);

    const apiStack = new ApiStack(this, `ApiStack-${props.environment}`, {
      environment: props.environment,
      dataApiUrl: props.dataApiUrl,
    })

    new DbStack(this, `DynamoDBStack-${props.environment}`, {
      tableSuffix: props.environment,
      writableBy: [apiStack.subscribeLambda, apiStack.userRemovalLambda],
      readableBy: [apiStack.publishLambda]
    })

  }
}
