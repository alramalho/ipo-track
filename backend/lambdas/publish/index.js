const https = require('https')
const {DynamoDBClient, ScanCommand} = require("@aws-sdk/client-dynamodb");
const dynamoDB = new DynamoDBClient({region: "eu-west-1"})
const {SESClient, SendEmailCommand} = require("@aws-sdk/client-ses");
const ses = new SESClient({region: "eu-west-1"});
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
  const dataApiUrl = event['stageVariables']['dataApiUrl']

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

  const body = await httpsExchange(dataApiUrl)
  const ipoRawData = JSON.parse(body)
  const parsedIpos = ipoRawData.map((ipo) => ipo['companyName'].split(" "))

  for (const user of activeUsers) {
    const email = user['email']['S']
    const keyword = user['keyword']['S']
    const keyword_words = keyword.split(" ")

    for (const ipoName of parsedIpos) {
      for (const word of ipoName) {
        if (keyword_words.includes(word.toLowerCase())) {
          const full_name = ipoName.join(' ')

          try {
            await ses.send(new SendEmailCommand({
              Destination: {
                'ToAddresses': [
                  email
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
            }))
            console.log(`${keyword} present in ${full_name} for ${email}`)
            console.log("Email sent!")
            await remove_user(email, keyword, environment)
            break

          } catch (e) {
            console.error(e)
          }
        }

      }
    }

  }
  return {
    "isBase64Encoded": false,
    'statusCode': 200,
    'body': JSON.stringify('Success')
  }

}

async function remove_user(user_email, user_keyword, environment) {
  try {
    await lambda.send(new InvokeCommand({
      FunctionName: `IPOWarningUserRemovalCDK-${environment}`,
      InvocationType: 'RequestResponse',
      Payload: new TextEncoder().encode(JSON.stringify({
        "stageVariables": {"environment": "sandbox"},
        "body": {
          'email': {'S': user_email},
          'keyword': {'S': user_keyword},
        }
      }))
    }))
    console.log("Successfully called user removal lambda for ", user_email)
  } catch (e) {
    console.error(e)
  }
}

async function httpsExchange(url) {
  const parsedUrl = new URL(url)
  const requestOptions = {
    host: parsedUrl.host,
    path: parsedUrl.pathname,
    method: "GET",
    protocol: "https:"
  }
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