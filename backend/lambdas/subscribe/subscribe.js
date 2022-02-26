const {DynamoDBClient, PutItemCommand} = require("@aws-sdk/client-dynamodb");
const dynamoDB = new DynamoDBClient({region: "eu-west-1"})
const {SESClient, SendEmailCommand} = require("@aws-sdk/client-ses");
const ses = new SESClient({region: "eu-west-1"});

const SENDER = 'warningipo@gmail.com'

function get_subject(keyword) {
  return `Confirming IPO alert subscription for '${keyword}'`
}

function get_body_html(keyword) {

  return `
    <html>
    <head></head>
    <body>
    <div style="max-width: 40rem; background: #fdfdfd; margin: 0 auto; font-family: sans-serif">
      <img style="object-fit: contain; width: 100%; height: auto"
           src="https://alramalhosandbox.s3.eu-west-1.amazonaws.com/ipo-bg.png" height="615" width="2481"/>
      <div style="padding: 1rem">
        <h1>Thank you for using IPO Track.</h1>
        <p>You are seeing this email because you subscribed to get an IPO email alert with the
          keyword "${keyword}" via ipo-track.com.
        </p>
      </div>
    
        <div style="background: #f7f7f7; padding: 1rem">
        <small><p>If you don't know what this is about or have any questions please reach us
          at
          https://www.ipo-track.com/contact.html.</p></small>
        </div>
    </div>
    </body>
    </html>
  `;
}


function get_body_text(keyword) {
  return `
  Thank you for using IPO Track.
  You are seeing this email because you subscribed to get an IPO email alert with the keyword "${keyword}" via ipo-track.com.
  If you don't know what this is about or have any questions please reach us at https://www.ipo-track.com/contact.html.
  `;
}

exports.handler = async (event) => {
  const environment = event['stageVariables']['environment']

  const body = JSON.parse(event['body'])

  if (!('email' in body) || !('keyword' in body)) {
    return build_response(400)
  }

  const user_email = body['email']
  const user_keyword = body['keyword']

  await dynamoDB.send(new PutItemCommand({
    TableName: `IPOTrackCDK-${environment}`,
    Item: {
      'email': {'S': user_email},
      'keyword': {'S': user_keyword.toLowerCase()},
      'activatedOn': {'S': new Date().toString()}
    }
  }))

  try {
    await ses.send(new SendEmailCommand({
      Destination: {
        'ToAddresses': [
          user_email
        ],
        'BccAddresses': [
          SENDER
        ]
      },
      Message: {
        'Body': {
          'Html': {
            'Charset': "UTF-8",
            'Data': get_body_html(user_keyword),
          },
          'Text': {
            'Charset': "UTF-8",
            'Data': get_body_text(user_keyword),
          },
        },
        'Subject': {
          'Charset': "UTF-8",
          'Data': get_subject(user_keyword),
        },
      },
      Source: SENDER,
    }))
  } catch (ex) {
    console.error(ex)
  }
  console.log("Email sent!")

  return build_response(201, 'User created!')
};

function build_response(statusCode, body = "") {
  return {
    "isBase64Encoded": false,
    "headers": {
      "Access-Control-Allow-Origin": "*"
    },
    'statusCode': statusCode,
    'body': body !== undefined ? JSON.stringify(body) : ""
  }
}