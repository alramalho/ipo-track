import {
  DynamoDBClient,
  QueryCommand,
  PutItemCommand,
  DeleteItemCommand
} from "@aws-sdk/client-dynamodb";
import { mocked } from 'ts-jest/utils';
import * as SES from "@aws-sdk/client-ses";
import * as lambda from "@aws-sdk/client-lambda";
import * as AWS from "aws-sdk"
AWS.config.update({region: 'eu-west-1'});

const dynamoDB = new DynamoDBClient({region: "eu-west-1"})

jest.mock('@aws-sdk/client-ses')
jest.mock('@aws-sdk/client-lambda')
import * as publishLambda from "../lambdas/publish"


describe('when testing the publish flow', () => {
  let MockedSES = mocked(SES, true);
  let MockedLambda = mocked(lambda, true);

  beforeEach(() => {
    jest.clearAllMocks()
  });

  it('should properly send the emails to matched users of 1 keyword', async () => {
    await dynamoDB.send(new PutItemCommand({
      TableName: "IPOWarningCDK-sandbox",
      Item: {
        'email': {'S': 'teste@teste.com'},
        'keyword': {'S': 'acme'},
        'activatedOn': {'S': new Date().toString()}
      }
    }))
    const requestBody = {
      "stageVariables": {
        "environment": "sandbox",
        "dataApiUrl": "https://arnnvraxch.execute-api.eu-west-1.amazonaws.com/sandbox/stocks"
      },
      "body": ""
    }

    const response = await publishLambda.handler(requestBody)

    expect(response).toEqual({
      "isBase64Encoded": false,
      'statusCode': 200,
      'body': JSON.stringify('Success')
    })

    const query = await dynamoDB.send(new QueryCommand({
      TableName: 'IPOWarningCDK-sandbox',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': {'S': "teste@teste.com"},
      }
    }))
    expect(query['Items'].length).toEqual(1)
    expect(query['Items'][0]['keyword']).toEqual({'S': 'acme'})

    expect(MockedSES.SendEmailCommand).toHaveBeenCalledTimes(1)
    expect(MockedLambda.InvokeCommand).toHaveBeenCalledTimes(1)

    await dynamoDB.send(new DeleteItemCommand({
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
})