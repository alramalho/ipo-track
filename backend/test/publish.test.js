import {
  DynamoDBClient,
  QueryCommand,
  PutItemCommand,
  DeleteItemCommand
} from "@aws-sdk/client-dynamodb";
import { mocked } from 'ts-jest/utils';
import * as SES from "@aws-sdk/client-sesv2";
import * as AWS from "aws-sdk"
AWS.config.update({region: 'eu-west-1'});

const dynamoDB = new DynamoDBClient({region: "eu-west-1"})

jest.mock('@aws-sdk/client-sesv2')
import * as publishLambda from "../lambdas/publish"


describe('when testing the publish flow', () => {
  let MockedSES = mocked(SES, true);

  beforeEach(() => {
    jest.clearAllMocks()
  });

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

    expect(MockedSES.SendEmailCommand).toHaveBeenCalledTimes(1)

    // verify(mockSESClient.send(anything())).once();
    // verify(mockSESClient.send(anyOfClass(SES.SendEmailCommand))).once();
    // TODO: Verify email was sent
  })
})