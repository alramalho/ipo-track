import {
  DynamoDBClient,
  QueryCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { mocked } from 'ts-jest/utils';
import * as SES from "@aws-sdk/client-ses";
import * as AWS from "aws-sdk"
AWS.config.update({region: 'eu-west-1'});

const dynamoDB = new DynamoDBClient({region: "eu-west-1"})

jest.mock('@aws-sdk/client-ses')
import * as userRemovalLambda from "../lambdas/user-removal"


describe('when testing the user removal flow', () => {
  let MockedSES = mocked(SES, true);

  beforeEach(() => {
    jest.clearAllMocks()
  });

  beforeAll(async () => {
    await dynamoDB.send(new PutItemCommand({
      TableName: "IPOWarningCDK-sandbox",
      Item: {
        'email': {'S': 'teste@teste.com'},
        'keyword': {'S': 'acme'},
        'activatedOn': {'S': new Date().toString()}
      }
    }))
  })


  it('should properly mark the user as non active and send the goodbye email', async () => {

    const requestBody = {
      "stageVariables": {"environment": "sandbox"},
      "body": {
        'email': {'S': "teste@teste.com"},
        'keyword': {'S': "acme"}
      }
    }

    const response = await userRemovalLambda.handler(requestBody)
    const query = await dynamoDB.send(new QueryCommand({
      TableName: 'IPOWarningCDK-sandbox',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': {'S': "teste@teste.com"},
      }
    }))

    expect(response).toEqual({
      'statusCode': 200,
      'body': 'User teste@teste.com deleted'
    })
    expect(query['Items'].length).toEqual(1)
    expect(query['Items'][0].activatedOn).toBeUndefined()
    expect(MockedSES.SendEmailCommand).toHaveBeenCalledTimes(1)
  })
})