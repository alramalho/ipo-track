import * as cdk from '@aws-cdk/core';
import {DbStack} from "./db-stack";
import {ApiStack} from "./api-stack";
import {FrontendStack} from "./frontend-stack";
import {SharedStack} from "./shared-stack";

interface MainStackProps {
  environment: string
  dataApiUrl: string
  rapidApiKey: string
}

export class MainStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props: MainStackProps) {
    super(scope, id);

    const sharedStack = new SharedStack(this, `SharedStack`)
    
    new FrontendStack(this, `FrontendStack-${props.environment}`, {
      environment: props.environment,
      sharedCertificate: sharedStack.certificate,
      sharedHostedZone: sharedStack.hostedZone
    })

    const apiStack = new ApiStack(this, `ApiStack-${props.environment}`, {
      environment: props.environment,
      dataApiUrl: props.dataApiUrl,
      rapidApiKey: props.rapidApiKey,
    })

    new DbStack(this, `DynamoDBStack-${props.environment}`, {
      tableSuffix: props.environment,
      writableBy: [apiStack.subscribeLambda, apiStack.userRemovalLambda],
      readableBy: [apiStack.publishLambda]
    })

  }
}
