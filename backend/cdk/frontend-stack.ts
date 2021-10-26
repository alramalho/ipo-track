import * as cdk from '@aws-cdk/core';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as s3 from '@aws-cdk/aws-s3';
import * as origins from '@aws-cdk/aws-cloudfront-origins';

interface FrontendStackProps {
  environment: string
}

export class FrontendStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props: FrontendStackProps) {
    super(scope, id);

    const bucket = new s3.Bucket(this, `Bucket-${props.environment}`, {
      bucketName: `ipo-warning-s3-bucket-${props.environment}`
    });
    const distribution = new cloudfront.Distribution(this, `IPOWarningDistribution-${props.environment}`, {
      defaultBehavior: { origin: new origins.S3Origin(bucket) },
      defaultRootObject: "index.html"
    });

    new cdk.CfnOutput(this, `${props.environment}S3Arn`, {value: bucket.bucketArn});
    new cdk.CfnOutput(this, `${props.environment}S3-S3Url`, {value: `s3://${bucket.bucketName}`});
    new cdk.CfnOutput(this, `${props.environment}CloudFrontDistributionID`, {value: distribution.distributionId});
    new cdk.CfnOutput(this, `${props.environment}CloudFrontDistributionURL`, {value: `https://${distribution.distributionDomainName}`});
  }
}
