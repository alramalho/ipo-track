import email_utils
import json
import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Attr

from urllib.request import urlopen

def lambda_handler(event, context):

    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('IPOWarningCDK')
    ses_client = boto3.client('ses',region_name="eu-west-1")

    query = table.scan(
        IndexName="activatedOn-index",
    )
    active_users = query['Items'] if 'Items' in query else []

    with urlopen("https://arnnvraxch.execute-api.eu-west-1.amazonaws.com/sandbox/stocks") as response:
        ipos = json.load(response)

    parsed_ipos = [ipo['companyName'].split() for ipo in ipos]

    for user in active_users:
        email = user['email']
        keyword = user['keyword']

        for ipo_name_arr in parsed_ipos:
            for ipo_name_part in ipo_name_arr:
                if ipo_name_part.lower() == keyword:
                    ipo_name = ' '.join(ipo_name_arr)
                    try:
                        response = ses_client.send_email(
                            Destination={
                                'ToAddresses': [
                                    email_utils.SENDER
                                ],
                            },
                            Message={
                                'Body': {
                                    'Html': {
                                        'Charset': "UTF-8",
                                        'Data': email_utils.get_body_html(ipo_name),
                                    },
                                    'Text': {
                                        'Charset': "UTF-8",
                                        'Data': email_utils.get_body_text(ipo_name),
                                    },
                                },
                                'Subject': {
                                    'Charset': "UTF-8",
                                    'Data': email_utils.get_subject(ipo_name),
                                },
                            },
                            Source=email_utils.SENDER,
                        )
                    except ClientError as e:
                        print(e.response['Error']['Message'])
                    else:
                        print("Email sent! Message ID:"),
                        print(response['MessageId'])


                    print(f'{ipo_name_part} present in {ipo_name} for {email}')

                    remove_user(email, keyword)


    return {
        "isBase64Encoded": False,
        'statusCode': 200,
        'body': json.dumps(f'Ipos with names {parsed_ipos} fetched and processed.')
    }


def remove_user(user_email, user_keyword):
    lambda_client = boto3.client('lambda')

    print("Tryuing to remove user: ", user_email)
    response = lambda_client.invoke(
        FunctionName = 'IPOWarningUserRemovalCDK',
        InvocationType = 'RequestResponse',
        Payload = json.dumps({'email': user_email, 'keyword': user_keyword})
    )
    print(response)
    if response['StatusCode'] is 200:
        print(response['Payload'].read())
    else:
        print("Could not remove user: ", user_email)
