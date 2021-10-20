import * as cdk from '@aws-cdk/core';
import * as apigw from '@aws-cdk/aws-apigateway';
import {DbStack} from "./db-stack";
import {ApiStack} from "./api-stack";

interface MainStackProps {
  environment: string
}

export class MainStack extends cdk.Stack {

  readonly api: apigw.RestApi;

  constructor(scope: cdk.Construct, id: string, props: MainStackProps) {
    super(scope, id);

    const apiStack = new ApiStack(this, `ApiStack-${props.environment}`, {
      environment: props.environment
    })

    new DbStack(this, `DynamoDBStack-${props.environment}`, {
      tableSuffix: props.environment,
      writableBy: [apiStack.subscribeLambda, apiStack.userRemovalLambda],
      readableBy: [apiStack.publishLambda]
    })

  }
}
