import unittest
import json
from backend.lambdas.subscribe.module.main import lambda_handler
import boto3


class TestSubscribe(unittest.TestCase):

    def test_insert_user_with_lowercased_keyword(self):
        request_body = {
            "stageVariables": {"environment": "sandbox"},
            "body": json.dumps({
                "email": "teste@teste.com",
                "keyword": "ACME"
            })
        }

        self.assertEqual(
            lambda_handler(request_body, None),
            {
                "isBase64Encoded": False,
                "headers": {
                    "Access-Control-Allow-Origin": "*"
                },
                'statusCode': 201,
                'body': json.dumps(f'User created!')
            },
            "Should properly insert an item"
        )

        dynamodb_client = boto3.client('dynamodb')
        response = dynamodb_client.query(
            TableName='IPOWarningCDK-sandbox',
            KeyConditionExpression='email = :email AND keyword = :keyword',
            ExpressionAttributeValues={
                ':email': {'S': "teste@teste.com"},
                ':keyword': {'S': 'acme'},
            }
        )

        self.assertEqual(len(response['Items']), 1)

        dynamodb_client.delete_item(
            TableName='IPOWarningCDK-sandbox',
            Key={
                'email': {
                    'S': 'teste@teste.com',
                },
                'keyword': {
                    'S': 'acme',
                },
            },
        )

    def test_total_bad_request(self):
        request_body = {
            "stageVariables": {"environment": "sandbox"},
            "body": json.dumps({
                "unexistent": "dummy"
            })
        }

        self.assertEqual(
            lambda_handler(request_body, None),
            {
                "isBase64Encoded": False,
                "headers": {
                    "Access-Control-Allow-Origin": "*"
                },
                'statusCode': 400,
                'body': ''
            },
            "Should properly return 400"
        )

    def test_bad_request_without_email(self):
        request_body = {
            "stageVariables": {"environment": "sandbox"},
            "body": json.dumps({
                "keyword": "ACME"
            })
        }

        self.assertEqual(
            lambda_handler(request_body, None),
            {
                "isBase64Encoded": False,
                "headers": {
                    "Access-Control-Allow-Origin": "*"
                },
                'statusCode': 400,
                'body': ''
            },
            "Should properly return 400"
        )

        dynamodb_client = boto3.client('dynamodb')
        response = dynamodb_client.query(
            TableName='IPOWarningCDK-sandbox',
            KeyConditionExpression='email = :email AND keyword = :keyword',
            ExpressionAttributeValues={
                ':email': {'S': "teste@teste.com"},
                ':keyword': {'S': 'acme'},
            }
        )

        self.assertEqual(len(response['Items']), 0)

        # TODO: Test activatedOn index
        # TODO: Test email was sent

    def test_bad_request_without_keyword(self):
        request_body = {
            "stageVariables": {"environment": "sandbox"},
            "body": json.dumps({
                "email": "teste@teste.com"
            })
        }

        self.assertEqual(
            lambda_handler(request_body, None),
            {
                "isBase64Encoded": False,
                "headers": {
                    "Access-Control-Allow-Origin": "*"
                },
                'statusCode': 400,
                'body': ''
            },
            "Should properly return 400"
        )

        dynamodb_client = boto3.client('dynamodb')
        response = dynamodb_client.query(
            TableName='IPOWarningCDK-sandbox',
            KeyConditionExpression='email = :email',
            ExpressionAttributeValues={
                ':email': {'S': "teste@teste.com"},
            }
        )

        self.assertEqual(len(response['Items']), 0)

