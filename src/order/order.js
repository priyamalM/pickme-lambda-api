const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");

const {
  DynamoDBDocumentClient,
  ScanCommand,
  PutCommand,
  GetCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const { sendResponse } = require("../../functions");

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "Orders";

module.exports.handler = async (event) => {
    let body;
    let statusCode = 200;
    const headers = {
        "Content-Type": "application/json",
    };
    try {
        switch (event.httpMethod) {
            case 'POST':
                let requestJSON = JSON.parse(event.body);
                await dynamo.send(
                  new PutCommand({
                    TableName: tableName,
                    Item: {
                      order_id: requestJSON.id,
                      name: requestJSON.name,
                      time: requestJSON.time
                    },
                  })
                );
                body = requestJSON;
                break;
            case 'GET':
                body = await dynamo.send(
                    new GetCommand({
                      TableName: tableName,
                      Key: {
                        order_id: event.pathParameters.id,
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