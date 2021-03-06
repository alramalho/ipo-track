import * as cdk from '@aws-cdk/core';
import {RemovalPolicy} from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import {AttributeType, BillingMode, Table} from '@aws-cdk/aws-dynamodb';
import * as iam from '@aws-cdk/aws-iam'

interface DbStackProps {
  tableSuffix?: string,
  writableBy?: iam.IGrantable[],
  readableBy?: iam.IGrantable[]
}

export class DbStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props?: DbStackProps) {
    super(scope, id);

    const dynamoTable = new Table(this, 'MainTable', {
      tableName: `IPOTrackCDK-${props?.tableSuffix || ""}`,
      partitionKey: {name: 'email', type: AttributeType.STRING},
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY
    });
    dynamoTable.addGlobalSecondaryIndex({
      indexName: 'activatedOn-index',
      partitionKey: {name: 'activatedOn', type: dynamodb.AttributeType.STRING},
      projectionType: dynamodb.ProjectionType.ALL,
    });
    props?.writableBy?.forEach(resource => dynamoTable.grantWriteData(resource))
    props?.readableBy?.forEach(resource => dynamoTable.grantReadData(resource))
    dynamoTable.applyRemovalPolicy(RemovalPolicy.RETAIN)

    new cdk.CfnOutput(this, 'DynamoDbTableName', {value: dynamoTable.tableName});
  }
}
