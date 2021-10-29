import {
  DynamoDBClient,
  QueryCommand,
  PutItemCommand,
  DeleteItemCommand
} from "@aws-sdk/client-dynamodb";
import {mocked} from 'ts-jest/utils';
import * as SES from "@aws-sdk/client-ses";
import * as lambda from "@aws-sdk/client-lambda";
import * as AWS from "aws-sdk"
import nock from 'nock';

AWS.config.update({region: 'eu-west-1'});

const dynamoDB = new DynamoDBClient({region: "eu-west-1"})

jest.mock('@aws-sdk/client-ses')
jest.mock('@aws-sdk/client-lambda')
import * as publishLambda from "../lambdas/publish"
import {mockIPOData} from "./mockedData";


describe('when testing the publish flow', () => {
  let MockedSES = mocked(SES, true);
  let MockedLambda = mocked(lambda, true);

  const mockApiUrl = 'https://localhost';
  const mockRapidApiKey = 'dummy';

  nock(mockApiUrl, {
    reqheaders: {
      'x-rapidapi-host': 'upcoming-ipo-calendar.p.rapidapi.com',
      'x-rapidapi-key': mockRapidApiKey
    },
  })
    .persist()
    .get('/',)
    .reply(200, mockIPOData,);


  beforeEach(() => {
    jest.clearAllMocks()
  });

  afterEach(async () => {
    await dynamoDB.send(new DeleteItemCommand({
      TableName: 'IPOWarningCDK-sandbox',
      Key: {
        'email': {
          'S': 'teste@teste.com',
        }
      },
    }))
  });

  afterAll(() => {
    nock.cleanAll()
  })

  describe('when there are matches', () => {

    it('should send the email and invoke the user removal lambda for single keyword match', async () => {
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
          "dataApiUrl": mockApiUrl,
          "rapidApiKey": mockRapidApiKey
          // TODO: Mock this API endpoint instead of having it in the cloud
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

      expect(MockedLambda.InvokeCommand).toHaveBeenCalledTimes(1)
      expect(MockedSES.SendEmailCommand).toHaveBeenCalledTimes(1)

      await dynamoDB.send(new DeleteItemCommand({
        TableName: 'IPOWarningCDK-sandbox',
        Key: {
          'email': {
            'S': 'teste@teste.com',
          }
        },
      }))
    })

    it('should send the email and invoke the user removal lambda for single keyword match', async () => {

      await dynamoDB.send(new PutItemCommand({
        TableName: "IPOWarningCDK-sandbox",
        Item: {
          'email': {'S': 'teste@teste.com'},
          'keyword': {'S': 'alma morta'},
          'activatedOn': {'S': new Date().toString()}
        }
      }))
      const requestBody = {
        "stageVariables": {
          "environment": "sandbox",
          "dataApiUrl": mockApiUrl,
          "rapidApiKey": mockRapidApiKey

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
      expect(query['Items'][0]['keyword']).toEqual({'S': 'alma morta'})

      expect(MockedSES.SendEmailCommand).toHaveBeenCalledTimes(1)
      expect(MockedLambda.InvokeCommand).toHaveBeenCalledTimes(1)

      await dynamoDB.send(new DeleteItemCommand({
        TableName: 'IPOWarningCDK-sandbox',
        Key: {
          'email': {
            'S': 'teste@teste.com',
          }
        },
      }))
    })
  })

  describe('when there are no matches', () => {
    it('should not send the emails or invoke the user removal lambda', async () => {
      await dynamoDB.send(new PutItemCommand({
        TableName: "IPOWarningCDK-sandbox",
        Item: {
          'email': {'S': 'teste@teste.com'},
          'keyword': {'S': 'non_existent'},
          'activatedOn': {'S': new Date().toString()}
        }
      }))
      const requestBody = {
        "stageVariables": {
          "environment": "sandbox",
          "dataApiUrl": mockApiUrl,
          "rapidApiKey": mockRapidApiKey
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
      expect(query['Items'][0]['keyword']).toEqual({'S': 'non_existent'})

      expect(MockedSES.SendEmailCommand).toHaveBeenCalledTimes(0)
      expect(MockedLambda.InvokeCommand).toHaveBeenCalledTimes(0)
    })
  })
})