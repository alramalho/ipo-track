const {
  DynamoDBClient,
  UpdateItemCommand
} = require("@aws-sdk/client-dynamodb");
const dynamoDB = new DynamoDBClient({region: "eu-west-1"})
const {SESClient, SendEmailCommand} = require("@aws-sdk/client-ses");
const ses = new SESClient({region: "eu-west-1"});

const SENDER = 'alexandre.ramalho.1998@gmail.com'

function get_subject() {
  return 'Thank you for using IPO Warning, and farewell'
}

function get_body_html(keyword) {

  return `
    <html>
        <head></head>
        <body>
          <h1>Thank you.</h1>
          <p>You are seeing this email because you previously subscribed to get an IPO email alert with the keyword "${keyword}" via ipo-warning.com.<p/>
          <p>By now you should have received the warning already. If that's not the case, please contact our support team at support@ipo-warning.com<p/>
          <p>This is the last email that you will receive from us.<p/>

          <small><p>If you don't know what this is about or have any questions please reach us at https://www.ipo-warning.com/contact.html.<small/>
        </body>
    </html>
  `;
}


function get_body_text(keyword) {
  return `
    Thank you for using IPO Warning.
    You are seeing this email because you previously subscribed to get an IPO email alert with the keyword "${keyword}" via ipo-warning.com.
    By now you should have received the warning already. If that's not the case, please contact our support team at support@ipo-warning.com
    This is the last email that you will receive from us.
    If you don't know what this is about or have any questions please reach us at https://www.ipo-warning.com/contact.html.
  `;
}

exports.handler = async (event) => {
  console.log(event)
  const environment = event['stageVariables']['environment']

  const body = event['body']
  const userEmail = body['email']['S']
  const userKeyword = body['keyword']['S']

  try {
    await ses.send(new SendEmailCommand({
      Destination: {
        'ToAddresses': [
          userEmail
        ],
      },
      Message: {
        'Body': {
          'Html': {
            'Charset': "UTF-8",
            'Data': get_body_html(userKeyword),
          },
          'Text': {
            'Charset': "UTF-8",
            'Data': get_body_text(userKeyword),
          },
        },
        'Subject': {
          'Charset': "UTF-8",
          'Data': get_subject(),
        },
      },
      Source: SENDER,
    }))
    console.log("Email sent!")

    await dynamoDB.send(new UpdateItemCommand({
      TableName: `IPOWarningCDK-${environment}`,
      Key: {email: {'S': userEmail}},
      UpdateExpression: "REMOVE activatedOn",
      ReturnValues: "UPDATED_NEW"
    }))
  } catch (ex) {
    console.log(ex)

    return {
      'statusCode': 500,
      'body': ex.toString()
    }
  }

  return {
    'statusCode': 200,
    'body': `User ${userEmail} deleted`
  }
}