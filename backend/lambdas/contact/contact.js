const {DynamoDBClient, PutItemCommand} = require("@aws-sdk/client-dynamodb");
const dynamoDB = new DynamoDBClient({region: "eu-west-1"})
const {SESClient, SendEmailCommand} = require("@aws-sdk/client-ses");
const ses = new SESClient({region: "eu-west-1"});

const SENDER = 'warningipo@gmail.com'

function get_subject(sender, subject) {
  return `IPO Track | Contact from '${sender}' | ${subject}`
}

function get_body_html(sender, subject, message) {

  return `
    <html>
    <head></head>
    <body>
      <div style="max-width: 40rem; background: #fdfdfd; margin: 0 auto; font-family: sans-serif">
        <img style="object-fit: contain; width: 100%; height: auto"
             src="https://alramalhosandbox.s3.eu-west-1.amazonaws.com/ipo-bg.png" height="615"
             width="2481"/>
        <div style="padding: 1rem">
          <h1>Contact from ${sender}.</h1>
          <h2>${subject}</h2>
          <p>${message}</p>
        </div>
    
        <div style="background: #f7f7f7; padding: 1rem">
          <small>
            <p>
              If you don't know what this is about or have any questions please reach us at
              https://ipo-track.alexramalho.dev/contact.html.
            </p>
            </small>
        </div>
      </div>
    </body>
  `;
}


function get_body_text(sender, subject, message) {
  return `
    Contact from ${sender}.
    Subject: ${subject}
    
    ${message}
  `;
}

exports.handler = async (event) => {
  const environment = event['stageVariables']['environment']

  const body = JSON.parse(event['body'])

  if (!('email' in body) || !('subject' in body) || !('message' in body)) {
    return build_response(400)
  }

  const user_email = body['email']
  const user_subject = `${environment} – ${body['subject']}`
  const user_message = body['message']

  try {
    await ses.send(new SendEmailCommand({
      Destination: {
        'ToAddresses': [
          SENDER,
          'alexandre.ramalho.1998@gmail.com'
        ],
      },
      Message: {
        'Body': {
          'Html': {
            'Charset': "UTF-8",
            'Data': get_body_html(user_email, user_subject, user_message),
          },
          'Text': {
            'Charset': "UTF-8",
            'Data': get_body_text(user_email, user_subject, user_message),
          },
        },
        'Subject': {
          'Charset': "UTF-8",
          'Data': get_subject(user_email, user_subject),
        },
      },
      Source: SENDER,
    }))
  } catch (ex) {
    console.error(ex)
  }
  console.log("Email sent!")

  return build_response(200, 'Email sent!')
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