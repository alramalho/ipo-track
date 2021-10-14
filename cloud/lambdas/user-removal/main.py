import json
import boto3
from botocore.exceptions import ClientError
import email_utils

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('IPOWarningCDK')
    ses_client = boto3.client('ses',region_name="eu-west-1")

    user_email=event['email']
    user_keyword=event['keyword']


    table.update_item(
        Key={'email': user_email},
        UpdateExpression="REMOVE activatedOn",
        ReturnValues="UPDATED_NEW"
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
                    'Data': email_utils.get_subject(),
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
        'statusCode': 200,
        'body': json.dumps(f'User {user_email} deleted')
    }
