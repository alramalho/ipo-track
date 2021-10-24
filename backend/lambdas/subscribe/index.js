const AWS = require('aws-sdk')
const dynamoDB = new AWS.DynamoDB()
const ses = new AWS.SESV2()


const SENDER = 'alexandre.ramalho.1998@gmail.com'

function get_subject(keyword) {
  return `Confirming IPO alert subscription for '${keyword}'`
}

function get_body_html(keyword) {

  return `
    <html>
    <head></head>
    <body>
    <h1>Thank you for using IPO Warning.</h1>
    <p>You are seeing this email because you subscribed to get an IPO email alert with the keyword "${keyword}" via ipo-warning.com.<p/>
    
      <small><p>If you don't know what this is about, please ignore this email.<small/>
    </body>
    </html>
  `;
}


function get_body_text(keyword) {
  return `
  Thank you for using IPO Warning.
  You are seeing this email because you subscribed to get an IPO email alert with the keyword "${keyword}" via ipo-warning.com.
  If you don't know what this is about, please ignore this email.
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

  dynamoDB.putItem({
    TableName: `IPOWarningCDK-${environment}`,
    Item: {
      'email': {'S': user_email},
      'keyword': {'S': user_keyword.toLowerCase()},
      'activatedOn': {'S': new Date().toString()}
    }
  })

  let error = false
  let response
  try {
    response = ses.sendEmail({
      Destination: {
        'ToAddresses': [
          user_email
        ],
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
    })
  } catch (ex) {
    error = true
    console.error(ex['message'])
  }
  if (!error) {
    console.log("Email sent! Message ID:"),
    console.log(response['MessageId'])
  }

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