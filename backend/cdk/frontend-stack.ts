import * as cdk from '@aws-cdk/core';
import {RemovalPolicy} from '@aws-cdk/core';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as s3 from '@aws-cdk/aws-s3';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
// import * as acm from '@aws-cdk/aws-certificatemanager';
// import * as route53 from '@aws-cdk/aws-route53';

interface FrontendStackProps {
  environment: string
}

export class FrontendStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props: FrontendStackProps) {
    super(scope, id);
    // const inProduction = props.environment == 'production'

    const bucket = new s3.Bucket(this, `Bucket-${props.environment}`, {
      bucketName: `ipo-warning-s3-bucket-${props.environment}`
    });

    let distributionOptions = {
      defaultBehavior: {origin: new origins.S3Origin(bucket)},
      defaultRootObject: "index.html",
      errorResponses: [{httpStatus: 404, responsePagePath: '/404.html'}],
    };

    // if (inProduction) {
    //   let myHostedZone = new route53.HostedZone(this, 'IpoWarningZone', {
    //     zoneName: 'ipo-warning.com',
    //   });
    //
    //   const myCertificate = new acm.Certificate(this, 'Certificate', {
    //     domainName: 'www.ipo-warning.com',
    //     validation: acm.CertificateValidation.fromDns(myHostedZone),
    //   })
    //
    //   // @ts-ignore
    //   distributionOptions['certificate'] = myCertificate
    //   // @ts-ignore
    //   distributionOptions['domainNames'] = ['www.ipo-warning.com']
    //
    //   myCertificate.applyRemovalPolicy(RemovalPolicy.DESTROY)
    //   myHostedZone.applyRemovalPolicy(RemovalPolicy.DESTROY)
    // }

    const distribution = new cloudfront.Distribution(this, `IPOWarningDistribution-${props.environment}`, distributionOptions)

    bucket.applyRemovalPolicy(RemovalPolicy.DESTROY)
    distribution.applyRemovalPolicy(RemovalPolicy.DESTROY)

    new cdk.CfnOutput(this, `${props.environment}S3Arn`, {value: bucket.bucketArn});
    new cdk.CfnOutput(this, `${props.environment}S3-S3Url`, {value: `s3://${bucket.bucketName}`});
    new cdk.CfnOutput(this, `${props.environment}CloudFrontDistributionID`, {value: distribution.distributionId});
    new cdk.CfnOutput(this, `${props.environment}CloudFrontDistributionURL`, {value: `https://${distribution.distributionDomainName}`});
  }
}
