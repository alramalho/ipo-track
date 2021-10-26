import * as cdk from '@aws-cdk/core';
import {RemovalPolicy} from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';
import {EndpointType, LambdaIntegration} from '@aws-cdk/aws-apigateway';
import * as iam from '@aws-cdk/aws-iam'
import {Rule, Schedule, RuleTargetInput} from '@aws-cdk/aws-events';
import {LambdaFunction} from '@aws-cdk/aws-events-targets';
import * as path from 'path';
import {NodejsFunction} from "@aws-cdk/aws-lambda-nodejs";

interface ApiStackProps {
  environment: string,
  dataApiUrl: string,
}

export class ApiStack extends cdk.Stack {

  readonly api: apigw.RestApi;
  readonly subscribeLambda: lambda.Function;
  readonly publishLambda: lambda.Function;
  readonly userRemovalLambda: lambda.Function;

  constructor(scope: cdk.Construct, id: string, props: ApiStackProps) {
    super(scope, id);

    const subscribeLambdaNameBaseName = 'IPOWarningSubscribeCDK'
    this.subscribeLambda = new NodejsFunction(this, 'SubscribeLambda', {
      functionName: `${subscribeLambdaNameBaseName}-${props.environment}`,
      entry: path.join(__dirname, '../lambdas/subscribe/index.js'), // accepts .js, .jsx, .ts and .tsx files
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(10),
    });
    this.subscribeLambda.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));
    this.subscribeLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail', 'SES:SendRawEmail'],
      resources: ['*'],
      effect: iam.Effect.ALLOW,
    }));

    this.publishLambda = new NodejsFunction(this, 'PublishLambda', {
      functionName: `IPOWarningPublishCDK-${props.environment}`,
      entry: path.join(__dirname, '../lambdas/publish/index.js'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(10)
    });
    const invokePublish = new LambdaFunction(this.publishLambda, {
      event: RuleTargetInput.fromObject({
        stageVariables: {environment: props.environment}
      })
    })

    const publishScheduleRule = new Rule(this, `TriggerPublish${props.environment}`, {
      ruleName: `TriggerPublishCDK-${props.environment}`,
      schedule: Schedule.cron({minute: '0', hour: '4'}),
      targets: [invokePublish],
    });
    this.publishLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail', 'SES:SendRawEmail'],
      resources: ['*'],
      effect: iam.Effect.ALLOW,
    }));

    this.userRemovalLambda = new NodejsFunction(this, 'UserRemovalLambda', {
      functionName: `IPOWarningUserRemovalCDK-${props.environment}`,
      entry: path.join(__dirname, '../lambdas/user-removal/index.js'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(10),
    });
    this.userRemovalLambda.grantInvoke(this.publishLambda);
    this.userRemovalLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail', 'SES:SendRawEmail'],
      resources: ['*'],
      effect: iam.Effect.ALLOW,
    }));

    this.api = new apigw.RestApi(this, 'IPOWarningRestAPI', {
      endpointConfiguration: {
        types: [EndpointType.REGIONAL]
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: ['POST']
      },
      restApiName: `IPOWarningCDK-${props.environment}`,
      deploy: false
    });
    const deployment = new apigw.Deployment(this, `${props.environment}_api_deployment`, {api: this.api});
    this.api.deploymentStage = new apigw.Stage(
      this,
      `${props.environment}_stage`,
      {
        deployment,
        stageName: props.environment,
        variables: {
          environment: props.environment,
          dataApiUrl: props.dataApiUrl,
        },
        loggingLevel: apigw.MethodLoggingLevel.INFO,
        dataTraceEnabled: true
      }
    );

    const subscribeResource = this.api.root.addResource('subscribe');
    const stageSubscribeLambda = lambda.Function.fromFunctionArn(
      this,
      `subscribe-lambda-stage`,
      `arn:aws:lambda:eu-west-1:854257060653:function:${subscribeLambdaNameBaseName}-\${stageVariables.environment}`
    )
    subscribeResource.addMethod('POST', new LambdaIntegration(stageSubscribeLambda, {
      proxy: true, // Make lambda responsible for building the API response according to https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-output-format
    }));

    this.subscribeLambda.applyRemovalPolicy(RemovalPolicy.DESTROY)
    this.publishLambda.applyRemovalPolicy(RemovalPolicy.DESTROY)
    this.userRemovalLambda.applyRemovalPolicy(RemovalPolicy.DESTROY)
    this.api.applyRemovalPolicy(RemovalPolicy.DESTROY)
    publishScheduleRule.applyRemovalPolicy(RemovalPolicy.DESTROY)

    // Outputs
    new cdk.CfnOutput(this, `${props.environment}SubscribeLambdaArn`, {value: this.subscribeLambda.functionArn});
    new cdk.CfnOutput(this, `${props.environment}PublishLambdaArn`, {value: this.subscribeLambda.functionArn});
    new cdk.CfnOutput(this, `${props.environment}UserRemovalLambdaArn`, {value: this.userRemovalLambda.functionArn});
    new cdk.CfnOutput(this, `${props.environment}ApiURL`, {value: `https://${this.api.restApiId}.execute-api.${this.region}.amazonaws.com/${props.environment}`});
    new cdk.CfnOutput(this, `${props.environment}SubscribeURL`, {
      value: `https://${this.api.restApiId}.execute-api.${this.region}.amazonaws.com/${props.environment}${subscribeResource.path}`,
    })
  }
}
