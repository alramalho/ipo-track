const https = require('https')
const {DynamoDBClient, ScanCommand} = require("@aws-sdk/client-dynamodb");
const dynamoDB = new DynamoDBClient({region: "eu-west-1"})
const {SESv2Client, SendEmailCommand} = require("@aws-sdk/client-sesv2");
const ses = new SESv2Client({region: "eu-west-1"});
const {LambdaClient, InvokeCommand} = require("@aws-sdk/client-lambda");
const lambda = new LambdaClient({region: "eu-west-1"});


const SENDER = 'alexandre.ramalho.1998@gmail.com'

function get_subject(ipo_name) {
  return `${ipo_name} is going public!`
}

function get_body_html(ipo_name) {

  return `
    <html>
        <head></head>
        <body>
          <h1>${ipo_name} is making an IPO!</h1>
          <a href="https://stockanalysis.com/ipos/calendar/">Click here to know the details.<a/>
          
          <small><p>If this is not the company you were looking for, email us at support@ipo-warning.com
          <small/>
        </body>
    </html>
  `;
}


function get_body_text(ipo_name) {
  return `
    Your IPO will go public!
    ${ipo_name} is finally listed to go public in the future!
    Go to https://stockanalysis.com/ipos/calendar to find more.
  `;
}

exports.handler = async (event) => {
  const environment = event['stageVariables']['environment']

  let activeUsers = []
  const query = await dynamoDB.send(new ScanCommand({
        TableName: `IPOWarningCDK-${environment}`,
        IndexName: "activatedOn-index"
      }
    )
  )
  if (query.Items !== undefined) {
    activeUsers = query.Items
  }

  const body = await httpsExchange({
    host: "arnnvraxch.execute-api.eu-west-1.amazonaws.com",
    path: "/sandbox/stocks",
    method: 'GET',
    protocol: 'https:'
  })
  const ipoRawData = JSON.parse(body)
  const parsedIpos = ipoRawData.map((ipo) => ipo['companyName'].split(" "))

  for (const user of activeUsers) {
    const email = user['email']['S']
    const keyword = user['keyword']['S']

    for (const ipoName of parsedIpos) {
      for (const word of ipoName) {
        if (word.toLowerCase() === keyword) {
          const full_name = ipoName.join(' ')

          console.log("TRIGGERED")
          ses.send(new SendEmailCommand({
            Destination: {
              'ToAddresses': [
                SENDER
              ],
            },
            Message: {
              'Body': {
                'Html': {
                  'Charset': "UTF-8",
                  'Data': get_body_html(full_name),
                },
                'Text': {
                  'Charset': "UTF-8",
                  'Data': get_body_text(full_name),
                },
              },
              'Subject': {
                'Charset': "UTF-8",
                'Data': get_subject(full_name),
              },
            },
            Source: SENDER,
          })).then((data) => {
            console.log("Email sent! Message ID:")
            console.log(data['MessageId'])
          }).catch((err) => {
            console.log(err)
          })

          console.log(`${keyword} present in ${full_name} for ${email}`)
        }

        remove_user(email, keyword, environment)
      }
    }

  }
  return {
    "isBase64Encoded": false,
    'statusCode': 200,
    'body': JSON.stringify('Success')
  }

}

function remove_user(user_email, user_keyword, environment) {
  lambda.send(new InvokeCommand({
    FunctionName: `IPOWarningUserRemovalCDK-${environment}`,
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify({'email': user_email, 'keyword': user_keyword})
  }))
    .then((data) => console.log(data.Payload))
    .catch((err) => console.error(err.message))
}

async function httpsExchange(requestOptions) {
  return new Promise((resolve, reject) => {
    const request = https.request(requestOptions, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error("Non-2xx status code: " + response.statusCode));
      }

      const body = [];

      response.on("data", (chunk) => body.push(chunk));

      response.on("end", () => resolve(body.join("")));
    });

    request.on("error", (err) => reject(err));

    request.end();
  });
}