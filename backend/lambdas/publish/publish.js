const https = require('https')
const {DynamoDBClient, ScanCommand} = require("@aws-sdk/client-dynamodb");
const dynamoDB = new DynamoDBClient({region: "eu-west-1"})
const {SESClient, SendEmailCommand} = require("@aws-sdk/client-ses");
const ses = new SESClient({region: "eu-west-1"});
const {LambdaClient, InvokeCommand} = require("@aws-sdk/client-lambda");
const lambda = new LambdaClient({region: "eu-west-1"});

const SENDER = 'warningipo@gmail.com'

function get_subject(ipo_name) {
  return `${ipo_name} is going public!`
}

function get_body_html(ipo_name, keyword) {

  return `
<html>
<head></head>
<body>
<div style="max-width: 40rem; background: #fdfdfd; margin: 0 auto; font-family: sans-serif">
  <img style="object-fit: contain; width: 100%; height: auto"
       src="https://alramalhosandbox.s3.eu-west-1.amazonaws.com/ipo-bg.png" height="615" width="2481"/>
  <div style="padding: 1rem">
    <h1>${ipo_name} is making an IPO!</h1>
    <p>You are seeing this email because you subscribed to get an IPO email alert with the
      keyword "${keyword}" via ipo-warning.com.
    </p>
    <a href="https://stockanalysis.com/ipos/calendar/">Click here to check the full IPO Calendar.</a>
  </div>

    <div style="background: #f7f7f7; padding: 1rem">
      <small><p>If this is not the company you were looking for, contact us via <a href="https://www.ipo-warning.com/contact.html" className="highlight">our contact form</a></p>
        </small>
        </div>
</div>
</body>
</html>

  `;
}


function get_body_text(ipo_name, keyword) {
  return `
    ${ipo_name} is making an IPO!
    Go to https://stockanalysis.com/ipos/calendar to check the full IPO Calendar.
    
    If this is not the company you were looking for, please contact us through www.ipo-warning.com/contact.html
  `;
}

exports.handler = async (event) => {
  const environment = event['stageVariables']['environment']
  const dataApiUrl = event['stageVariables']['dataApiUrl']
  const rapidApiKey = event['stageVariables']['rapidApiKey']

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

  const body = await getIpoData(dataApiUrl, rapidApiKey)
  const ipoRawData = JSON.parse(body)['data']
  const parsedIpos = ipoRawData.map((ipo) => ipo['name'].toLowerCase().replace(/,|\.|;/g, '').split(" "))

  for (const user of activeUsers) {
    const email = user['email']['S']
    const keyword = user['keyword']['S']

    for (const ipoName of parsedIpos) {
      const full_ipo_name = ipoName.join(' ')
      if (full_ipo_name.includes(keyword)) {
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
                  'Data': get_body_html(full_ipo_name, keyword),
                },
                'Text': {
                  'Charset': "UTF-8",
                  'Data': get_body_text(full_ipo_name, keyword),
                },
              },
              'Subject': {
                'Charset': "UTF-8",
                'Data': get_subject(full_ipo_name),
              },
            },
            Source: SENDER,
          }))
          console.log(`${keyword} present in ${full_ipo_name} for ${email}`)
          console.log("Email sent!")
          await remove_user(email, keyword, environment)
          break

        } catch (e) {
          console.error(e)
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

async function getIpoData(url, rapidApiKey) {
  const parsedUrl = new URL(url)
  const requestOptions = {
    host: parsedUrl.host,
    path: parsedUrl.pathname,
    headers: {
      'x-rapidapi-host': 'upcoming-ipo-calendar.p.rapidapi.com',
      'x-rapidapi-key': rapidApiKey
    },
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