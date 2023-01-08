import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "http-crud-tutorial-items";

module.exports.handler = async (event, context) => {
    try {
        let body;
        let statusCode = 200;
        const headers = {
            "Content-Type": "application/json",
        };
        switch (event.httpMethod) {
            case 'POST':
                body = await dynamo.put(JSON.parse(event.body)).promise();
                break;
            case 'GET /{id}':
                body = await dynamo.send(
                    new GetCommand({
                      TableName: tableName,
                      Key: {
                        id: event.pathParameters.id,
                      },
                    })
                  );
                  body = body.Item;
                  break;
            default:
                throw new Error(`Unsupported route: "${event.routeKey}"`);        
        }

        // return sendResponse(200, { message: 'Success', token: response.AuthenticationResult.IdToken })
    }
    catch (error) {
        const message = error.message ? error.message : 'Internal server error'
        statusCode = 400;
        body = message;
        return sendResponse(500, { message })
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
      };
}