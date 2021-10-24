const AWS = require('aws-sdk')
AWS.config.update({region: 'eu-west-1'});
import {
  DynamoDBClient,
  QueryCommand,
  PutItemCommand,
  DeleteItemCommand
} from "@aws-sdk/client-dynamodb";

const dynamoDB = new DynamoDBClient({region: "eu-west-1"})
import * as SES from "@aws-sdk/client-sesv2";
import {anyOfClass, anything, mock, verify} from "ts-mockito"

let mockSESClient = mock(SES.SESv2Client);
// const sendEmailMock = jest.fn(() => ({resolveMiddleware: () => {}}))

const publishLambda = require("../lambdas/publish")

describe('when testing the publish flow', () => {
  beforeAll(() => {
    dynamoDB.send(new PutItemCommand({
      TableName: "IPOWarningCDK-sandbox",
      Item: {
        'email': {'S': 'teste@teste.com'},
        'keyword': {'S': 'acme'},
        'activatedOn': {'S': new Date().toString()}
      }
    }))
  })
  afterAll(() => {

    dynamoDB.send(new DeleteItemCommand({
      TableName: 'IPOWarningCDK-sandbox',
      Key: {
        'email': {
          'S': 'teste@teste.com',
        },
        'keyword': {
          'S': 'acme',
        },
      },
    }))
  })

  it('should properly send the emails to matched users', async () => {
    jest.mock('@aws-sdk/client-sesv2', () => {
      const originalModule = jest.requireActual('@aws-sdk/client-sesv2');

      return {
        __esModule: true, // Use it when dealing with esModules
        ...originalModule,
        SESv2Client: mockSESClient,
      };
    });
    const requestBody = {
      "stageVariables": {"environment": "sandbox"},
      "body": ""
    }

    const response = await publishLambda.handler(requestBody)

    expect(response).toEqual({
      "isBase64Encoded": false,
      'statusCode': 200,
      'body': JSON.stringify('Success')
    })

    const data = await dynamoDB.send(new QueryCommand({
      TableName: 'IPOWarningCDK-sandbox',
      KeyConditionExpression: 'email = :email AND keyword = :keyword',
      ExpressionAttributeValues: {
        ':email': {'S': "teste@teste.com"},
        ':keyword': {'S': 'acme'},
      }
    }))
    expect(data['Items'].length).toEqual(1)
    verify(mockSESClient.send(anything())).once();
    // verify(mockSESClient.send(anyOfClass(SES.SendEmailCommand))).once();
    // TODO: Verify email was sent
  })
})