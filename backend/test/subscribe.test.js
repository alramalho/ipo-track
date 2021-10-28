const AWS = require('aws-sdk')
const {QueryCommand} = require("@aws-sdk/client-dynamodb");
AWS.config.update({region:'eu-west-1'});
const {DynamoDBClient} = require("@aws-sdk/client-dynamodb");
const {mocked} = require("ts-jest/utils");
const SES = require("@aws-sdk/client-ses");
const dynamoDB = new DynamoDBClient({region: "eu-west-1"})
jest.mock('@aws-sdk/client-ses')
const subscribeLambda = require("../lambdas/subscribe/index")

describe('when testing the subscribe flow', () => {
  let MockedSES = mocked(SES, true);

  beforeEach(() => {
    jest.clearAllMocks()
  });

  afterAll(() => {

    dynamoDB.deleteItem({
      TableName: 'IPOWarningCDK-sandbox',
      Key: {
        'email': {
          'S': 'teste@teste.com',
        },
        'keyword': {
          'S': 'acme',
        },
      },
    })
  })

  it('should properly register the user', async () => {
    const request_body = {
      "stageVariables": {"environment": "sandbox"},
      "body": JSON.stringify({
        "email": "teste@teste.com",
        "keyword": "ACME"
      })
    }

    const response = await subscribeLambda.handler(request_body)

    expect(response).toEqual({
      "isBase64Encoded": false,
      "headers": {
        "Access-Control-Allow-Origin": "*"
      },
      'statusCode': 201,
      'body': JSON.stringify('User created!')
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

  })
})