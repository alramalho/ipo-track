import * as cdk from '@aws-cdk/core';
import {RemovalPolicy} from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import {AttributeType, BillingMode, Table} from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';
import {EndpointType, LambdaIntegration} from '@aws-cdk/aws-apigateway';
import * as iam from '@aws-cdk/aws-iam'
import {Rule, Schedule} from '@aws-cdk/aws-events';
import {LambdaFunction} from '@aws-cdk/aws-events-targets';
import * as path from 'path';
import {PythonFunction} from "@aws-cdk/aws-lambda-python";

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dynamoTable = new Table(this, 'MainTable', {
      tableName: 'IPOWarningCDK',
      partitionKey: {name: 'email', type: AttributeType.STRING},
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    });
    dynamoTable.addGlobalSecondaryIndex({
      indexName: 'activatedOn-index',
      partitionKey: {name: 'activatedOn', type: dynamodb.AttributeType.STRING},
      projectionType: dynamodb.ProjectionType.ALL,
    });

    const subscribeLambda = new PythonFunction(this, 'SubscribeLambda', {
      functionName: 'IPOWarningSubscribeCDK',
      entry: path.join(__dirname, '../lambdas/subscribe/'),
      index: 'main.py',
      handler: 'lambda_handler', // optional, defaults to 'handler'
      runtime: lambda.Runtime.PYTHON_3_9, // optional, defaults to lambda.Runtime.PYTHON_3_7
      memorySize: 1024,
      timeout: cdk.Duration.seconds(10),
    });
    subscribeLambda.grantInvoke(new iam.ServicePrincipal('apigateway.amazonaws.com'));
    dynamoTable.grantWriteData(subscribeLambda);
    subscribeLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail', 'SES:SendRawEmail'],
      resources: ['*'],
      effect: iam.Effect.ALLOW,
    }));

    const publishLambda = new PythonFunction(this, 'PublishLambda', {
      functionName: 'IPOWarningPublishCDK',
      entry: path.join(__dirname, '../lambdas/publish/'),
      index: 'main.py',
      handler: 'lambda_handler',
      runtime: lambda.Runtime.PYTHON_3_9,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(10),
    });
    dynamoTable.grantReadData(publishLambda);
    const invokePublish = new LambdaFunction(publishLambda)
    const publishScheduleRule = new Rule(this, 'DailyTriggerPublish', {
      ruleName: 'DailyTriggerPublishCDK',
      schedule: Schedule.cron({ minute: '0', hour: '4' }),
      targets: [invokePublish],
    });
    publishLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail', 'SES:SendRawEmail'],
      resources: ['*'],
      effect: iam.Effect.ALLOW,
    }));

    const userRemovalLambda = new PythonFunction(this, 'UserRemovalLambda', {
      functionName: 'IPOWarningUserRemovalCDK',
      entry: path.join(__dirname, '../lambdas/user-removal/'),
      index: 'main.py',
      handler: 'lambda_handler',
      runtime: lambda.Runtime.PYTHON_3_9,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(10),
    });
    dynamoTable.grantWriteData(userRemovalLambda);
    userRemovalLambda.grantInvoke(publishLambda);
    userRemovalLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail', 'SES:SendRawEmail'],
      resources: ['*'],
      effect: iam.Effect.ALLOW,
    }));

    const api = new apigw.RestApi(this, 'IPOWarningRestAPI', {
      endpointConfiguration: {
        types: [EndpointType.REGIONAL]
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: ['POST']
      },
      restApiName: "IPOWarningCDK",
      deploy: false
    });
    const subscribeResource = api.root.addResource('subscribe');
    subscribeResource.addMethod('POST', new LambdaIntegration(subscribeLambda, {
      proxy: true // Make lambda responsible for building the API response according to https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-output-format
    }));

    const deployment  = new apigw.Deployment(this, 'api_deployment', { api });

    const [sandboxStage, prodStage] = ['sandbox', 'production'].map(item =>
      new apigw.Stage(this, `${item}_stage`, { deployment, stageName: item }));

    api.deploymentStage = prodStage

    dynamoTable.applyRemovalPolicy(RemovalPolicy.DESTROY)
    subscribeLambda.applyRemovalPolicy(RemovalPolicy.DESTROY)
    publishLambda.applyRemovalPolicy(RemovalPolicy.DESTROY)
    userRemovalLambda.applyRemovalPolicy(RemovalPolicy.DESTROY)
    api.applyRemovalPolicy(RemovalPolicy.DESTROY)
    publishScheduleRule.applyRemovalPolicy(RemovalPolicy.DESTROY)

    // Outputs
    new cdk.CfnOutput(this, 'DynamoDbTableName', {value: dynamoTable.tableName});
    new cdk.CfnOutput(this, 'SubscribeLambdaArn', {value: subscribeLambda.functionArn});
    new cdk.CfnOutput(this, 'PublishLambdaArn', {value: subscribeLambda.functionArn});
    new cdk.CfnOutput(this, 'UserRemovalLambdaArn', {value: userRemovalLambda.functionArn});
    new cdk.CfnOutput(this, 'SubscribeURL', {
      value: `https://${api.restApiId}.execute-api.${this.region}.amazonaws.com/prod${subscribeResource.path}`,
    })
  }
}
