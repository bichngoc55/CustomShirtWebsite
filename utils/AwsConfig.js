const { RekognitionClient } = require("@aws-sdk/client-rekognition");
const { BedrockRuntimeClient } = require("@aws-sdk/client-bedrock-runtime");

class AwsConfig {
  constructor() {
    const awsConfig = {
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    };

    this.rekognitionClient = new RekognitionClient(awsConfig);

    this.bedrockClient = new BedrockRuntimeClient(awsConfig);
  }

  getRekognitionClient() {
    return this.rekognitionClient;
  }

  getBedrockClient() {
    return this.bedrockClient;
  }
}

module.exports = new AwsConfig();
