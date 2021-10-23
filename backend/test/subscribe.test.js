const subscribeLambda = require("../lambdas/subscribe/index")
const AWS = require('aws-sdk')
AWS.config.update({region:'eu-west-1'});
const dynamoDB = new AWS.DynamoDB()

describe('when testing the subscribe flow', () => {
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

    const query = dynamoDB.query({
      TableName: 'IPOWarningCDK-sandbox',
      KeyConditionExpression: 'email = :email AND keyword = :keyword',
      ExpressionAttributeValues: {
        ':email': {'S': "teste@teste.com"},
        ':keyword': {'S': 'acme'},
      }
    }, function (err, data) {
      expect(data['Items'].length).toEqual(1)
    })
  })
})