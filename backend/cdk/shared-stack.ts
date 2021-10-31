import * as cdk from '@aws-cdk/core';
import {RemovalPolicy} from '@aws-cdk/core';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as route53 from '@aws-cdk/aws-route53';

export class SharedStack extends cdk.Stack {

  readonly hostedZone: route53.IHostedZone
  readonly certificate: acm.ICertificate

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    this.hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'SharedHostedZone', {
      hostedZoneId: "Z06420601ZYM964XOXTOX",
      zoneName: "ipo-warning.com"
    })
    this.certificate = acm.Certificate.fromCertificateArn(this, `SharedCertificate`, "arn:aws:acm:us-east-1:854257060653:certificate/3c473564-082d-4d3b-96ee-b8527d91dc50")
  }
}
