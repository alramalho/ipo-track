const {
  DynamoDBClient,
  UpdateItemCommand
} = require("@aws-sdk/client-dynamodb");
const dynamoDB = new DynamoDBClient({region: "eu-west-1"})
const {SESv2Client, SendEmailCommand} = require("@aws-sdk/client-sesv2");
const ses = new SESv2Client({region: "eu-west-1"});

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

          <small><p>If you don't know what this is about, please ignore this email.<small/>
        </body>
    </html>
  `;
}


function get_body_text(keyword) {
  return `
    Thank you for using IPO Warning.
    You are seeing this email because you previously subscribed to get an IPO email alert with the keyword "${keyword}" via ipo-warning.com.
    By now you should have received the warning already. If that's not the case, please contact our support team at support@ipo-warning.com
    If you don't know what this is about, please ignore this email.
  `;
}

exports.handler = async (event) => {
  const environment = event['stageVariables']['environment']

  const body = JSON.parse(event['body'])

  const userEmail = body['email']['S']
  const userKeyword = body['keyword']['S']

  await dynamoDB.send(new UpdateItemCommand({
    TableName: `IPOWarningCDK-${environment}`,
    Key: {email: {'S': userEmail}, keyword: {'S': userKeyword}},
    UpdateExpression: "REMOVE activatedOn",
    ReturnValues: "UPDATED_NEW"
  }))

  try {
    const data = ses.send(new SendEmailCommand({
      Destination: {
        'ToAddresses': [
          SENDER
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
    if (data !== undefined) {
      console.log("Email sent! Message ID:")
      console.log(data['MessageId'])
    }

  } catch (ex) {
    console.log(ex)
  }

  return {
    'statusCode': 200,
    'body': `User ${userEmail} deleted`
  }
}