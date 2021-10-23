import json
import boto3
import datetime
from botocore.exceptions import ClientError
from . import email_utils


def lambda_handler(event, context):
    environment = event['stageVariables']['environment']

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(f'IPOWarningCDK-{environment}')
    ses_client = boto3.client('ses', region_name="eu-west-1")

    body = json.loads(event['body'])

    if 'email' not in body or 'keyword' not in body:
        return build_response(400)

    user_email = body['email']
    user_keyword = body['keyword']

    table.put_item(
        Item={
            'email': user_email,
            'keyword': user_keyword.lower(),
            'activatedOn': str(datetime.datetime.utcnow())
        }
    )

    try:
        response = ses_client.send_email(
            Destination={
                'ToAddresses': [
                    user_email
                ],
            },
            Message={
                'Body': {
                    'Html': {
                        'Charset': "UTF-8",
                        'Data': email_utils.get_body_html(user_keyword),
                    },
                    'Text': {
                        'Charset': "UTF-8",
                        'Data': email_utils.get_body_text(user_keyword),
                    },
                },
                'Subject': {
                    'Charset': "UTF-8",
                    'Data': email_utils.get_subject(user_keyword),
                },
            },
            Source=email_utils.SENDER,
        )

    except ClientError as e:
        print(e.response['Error']['Message'])
    else:
        print("Email sent! Message ID:"),
        print(response['MessageId'])

    return build_response(201, 'User created!')


def build_response(status_code, body=""):
    return {
        "isBase64Encoded": False,
        "headers": {
            "Access-Control-Allow-Origin": "*"
        },
        'statusCode': status_code,
        'body': json.dumps(body) if body else ""
    }
