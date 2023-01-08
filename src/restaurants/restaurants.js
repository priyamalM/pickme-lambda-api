// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "restaurants-table";

module.exports.handler = async (event) => {
    try {
        let body;
        let statusCode = 200;
        const headers = {
            "Content-Type": "application/json",
        };
        switch (event.httpMethod) {
            case 'POST':
                body = await dynamo.put(JSON.parse(event.body)).promise();
                let requestJSON = JSON.parse(event.body);
                await dynamo.send(
                  new PutCommand({
                    TableName: tableName,
                    Item: {
                      id: requestJSON.id,
                      location: requestJSON.town,
                      name: requestJSON.name,
                    },
                  })
                );
        body = `Put item ${requestJSON.id}`;
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