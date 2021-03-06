const {
  DynamoDBClient,
  UpdateItemCommand
} = require("@aws-sdk/client-dynamodb");
const dynamoDB = new DynamoDBClient({region: "eu-west-1"})
const {SESClient, SendEmailCommand} = require("@aws-sdk/client-ses");
const ses = new SESClient({region: "eu-west-1"});

const SENDER = 'warningipo@gmail.com'

function get_subject() {
  return 'Thank you for using IPO Track, and farewell'
}

function get_body_html(keyword) {

  return `
    <html>
    <head></head>
    <body>
      <div style="max-width: 40rem; background: #fdfdfd; margin: 0 auto; font-family: sans-serif">
        <img style="object-fit: contain; width: 100%; height: auto"
             src="https://alramalhosandbox.s3.eu-west-1.amazonaws.com/ipo-bg.png" height="615"
             width="2481"/>
        <div style="padding: 1rem">
          <h1>Thank you.</h1>
          <p>You are seeing this email because you previously subscribed to get an IPO email
            alert with the keyword "${keyword}" via ipo-track.com.
          </p>
          <p>By now you should have received the track already. If that's not the case, please
            contact our support team at the contact form in our webpage.
          </p>
          <p>This is the last email that you will receive from us.
          </p>
          <a href="https://stockanalysis.com/ipos/calendar/">Click here to check the full IPO
            Calendar.</a>
        </div>
    
        <div style="background: #f7f7f7; padding: 1rem">
          <small>
            <p>
              If you don't know what this is about or have any questions please reach us at
              https://www.ipo-track.com/contact.html.
            </p>
            </small>
        </div>
      </div>
    </body>
    </html>
  `;
}


function get_body_text(keyword) {
  return `
    Thank you for using IPO Track.
    You are seeing this email because you previously subscribed to get an IPO email alert with the keyword "${keyword}" via ipo-track.com.
    By now you should have received the track already. If that's not the case, please contact our support team using the contact form present in our webpage
    This is the last email that you will receive from us.
    If you don't know what this is about or have any questions please reach us at https://www.ipo-track.com/contact.html.
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
        'BccAddresses': [
          SENDER
        ]
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
      TableName: `IPOTrackCDK-${environment}`,
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