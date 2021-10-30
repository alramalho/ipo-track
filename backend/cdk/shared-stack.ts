import * as cdk from '@aws-cdk/core';
import {RemovalPolicy} from '@aws-cdk/core';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as route53 from '@aws-cdk/aws-route53';

export class SharedStack extends cdk.Stack {

  readonly hostedZone: route53.HostedZone
  readonly certificate: acm.DnsValidatedCertificate

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    this.hostedZone = new route53.HostedZone(this, 'IpoWarningZone', {
      zoneName: 'ipo-warning.com',
    });
    new route53.ZoneDelegationRecord(this, `AWSNs`, {
      zone: this.hostedZone,
      recordName: '*.ipo-warning.com',
      nameServers: ['ns-1935.awsdns-49.co.uk.', 'ns-544.awsdns-04.net.', 'ns-444.awsdns-55.com.', 'ns-1500.awsdns-59.org.']

    })

    this.certificate = new acm.DnsValidatedCertificate(this, 'CrossRegionCertificate', {
      domainName: 'ipo-warning.com',
      hostedZone: this.hostedZone,
      region: 'us-east-1',
      validation: acm.CertificateValidation.fromDnsMultiZone({
        'www.ipo-warning.com': this.hostedZone,
        'sandbox.ipo-warning.com': this.hostedZone,
      })
    })

    // TODO: apply removal policy to certificate
    this.hostedZone.applyRemovalPolicy(RemovalPolicy.DESTROY)
  }
}
