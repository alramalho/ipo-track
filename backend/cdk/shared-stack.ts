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
      hostedZoneId: "Z06380513UVH7N8Q9MJNO",
      zoneName: "ipo-track.com"
    })
    this.certificate = acm.Certificate.fromCertificateArn(this, `SharedCertificate`, "arn:aws:acm:us-east-1:854257060653:certificate/12c204cf-42b2-4daf-95a0-3209f7e4bbc4")
  }
}
