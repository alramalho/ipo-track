import json
import boto3
import datetime
from botocore.exceptions import ClientError
import email_utils


def lambda_handler(event, context):

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('IPOWarningCDK')
    ses_client = boto3.client('ses',region_name="eu-west-1")

#     print(event)

    # current_keywords = (
        # table.get_item(Key={'email': event['email']})['Item']['keywords']
        # if 'Item' in table.get_item(Key={'email': event['email']})
        # and table.get_item(Key={'email': event['email']})['Item']['keywords']  is not None
        # else [])

    # new_keywords = event['keyword']
    # new_keywords.extend(current_keywords)
    body = json.loads(event['body'])
    user_email=body['email']
    user_keyword=body['keyword']

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

    return {
        "isBase64Encoded": False,
        "headers": {
            "Access-Control-Allow-Origin": "*"
        },
        'statusCode': 201,
        'body': json.dumps(f'User created!')
    }
