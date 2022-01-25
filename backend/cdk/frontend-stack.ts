import * as cdk from '@aws-cdk/core';
import {RemovalPolicy} from '@aws-cdk/core';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as s3 from '@aws-cdk/aws-s3';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as route53 from '@aws-cdk/aws-route53';

import * as targets from '@aws-cdk/aws-route53-targets';


interface FrontendStackProps {
  environment: string,
  sharedCertificate: acm.ICertificate
  sharedHostedZone: route53.IHostedZone
}

export class FrontendStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props: FrontendStackProps) {
    super(scope, id);
    const inProduction = props.environment == 'production'

    const bucket = new s3.Bucket(this, `Bucket-${props.environment}`, {
      bucketName: `ipo-track-s3-bucket-${props.environment}`
    });

    const distribution = new cloudfront.Distribution(this, `IPOTrackDistribution-${props.environment}`, {
      defaultBehavior: {origin: new origins.S3Origin(bucket)},
      defaultRootObject: "index.html",
      errorResponses: [
        {httpStatus: 404, responsePagePath: '/404.html'},
        {httpStatus: 403, responsePagePath: '/404.html'}
      ],
      domainNames: inProduction ? ['www.ipo-warning.com'] : ['sandbox.ipo-warning.com'],
      certificate: props.sharedCertificate
    })

    new route53.ARecord(this, `ARecord-${props.environment}`, {
      recordName: inProduction ? "www.ipo-warning.com" : "sandbox.ipo-warning.com",
      zone: props.sharedHostedZone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution))
    });

    bucket.applyRemovalPolicy(RemovalPolicy.DESTROY)
    distribution.applyRemovalPolicy(RemovalPolicy.DESTROY)

    new cdk.CfnOutput(this, `${props.environment}S3Arn`, {value: bucket.bucketArn});
    new cdk.CfnOutput(this, `${props.environment}S3-S3Url`, {value: `s3://${bucket.bucketName}`});
    new cdk.CfnOutput(this, `${props.environment}CloudFrontDistributionID`, {value: distribution.distributionId});
    new cdk.CfnOutput(this, `${props.environment}CloudFrontDistributionURL`, {value: `https://${distribution.distributionDomainName}`});
  }
}
