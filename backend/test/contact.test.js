const AWS = require('aws-sdk')
AWS.config.update({region:'eu-west-1'});
const {mocked} = require("ts-jest/utils");
const SES = require("@aws-sdk/client-ses");
jest.mock('@aws-sdk/client-ses')
const contactLambda = require("../lambdas/contact/contact")

describe('when testing the contact flow', () => {
  let MockedSES = mocked(SES, true);

  beforeEach(() => {
    jest.clearAllMocks()
  });

  it('should properly send the email', async () => {
    const request_body = {
      "stageVariables": {"environment": "sandbox"},
      "body": JSON.stringify({
        "email": "teste@teste.com",
        "subject": "ACME",
        "message": "Teste"
      })
    }

    const response = await contactLambda.handler(request_body)

    expect(response).toEqual({
      "isBase64Encoded": false,
      "headers": {
        "Access-Control-Allow-Origin": "*"
      },
      'statusCode': 200,
      'body': JSON.stringify('Email sent!')
    })

    expect(MockedSES.SendEmailCommand).toHaveBeenCalledTimes(1)
  })

  it('should return 400 when subject not present', async () => {
    const request_body = {
      "stageVariables": {"environment": "sandbox"},
      "body": JSON.stringify({
        "email": "teste@teste.com",
        "message": "Teste"
      })
    }

    const response = await contactLambda.handler(request_body)

    expect(response).toEqual({
      "isBase64Encoded": false,
      "headers": {
        "Access-Control-Allow-Origin": "*"
      },
      'statusCode': 400,
      'body': JSON.stringify('')
    })

    expect(MockedSES.SendEmailCommand).toHaveBeenCalledTimes(0)
  })

  it('should return 400 when message not present', async () => {
    const request_body = {
      "stageVariables": {"environment": "sandbox"},
      "body": JSON.stringify({
        "email": "teste@teste.com",
        "subject": "Teste"
      })
    }

    const response = await contactLambda.handler(request_body)

    expect(response).toEqual({
      "isBase64Encoded": false,
      "headers": {
        "Access-Control-Allow-Origin": "*"
      },
      'statusCode': 400,
      'body': JSON.stringify('')
    })

    expect(MockedSES.SendEmailCommand).toHaveBeenCalledTimes(0)
  })
})