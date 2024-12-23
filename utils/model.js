const { InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { removeBackground } = require("@imgly/background-removal-node");
const awsConfig = require("./AwsConfig");
class TitanImageService {
  constructor() {
    this.client = awsConfig.getBedrockClient();
  }

  async generateImage(prompt) {
    const params = {
      modelId: "amazon.titan-image-generator-v2:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        taskType: "TEXT_IMAGE",
        textToImageParams: {
          text: prompt,
        },
        imageGenerationConfig: {
          cfgScale: 7,
          seed: 42,
          quality: "standard",
          width: 512,
          height: 512,
          numberOfImages: 3,
        },
      }),
    };

    try {
      const command = new InvokeModelCommand(params);
      const response = await this.client.send(command);

      const decodedResponse = JSON.parse(
        Buffer.from(response.body).toString("utf8")
      );
      const processedImages = await this.removeBackgroundFromImages(
        decodedResponse.images
      );
      return {
        imageBase64: processedImages,
        success: true,
      };
    } catch (error) {
      console.error("Detailed Titan Image Generation error:", error);
      return {
        success: false,
        error: error.message || "Unknown error",
        fullError: error,
      };
    }
  }
  async removeBackgroundFromImages(base64Images) {
    try {
      const processedImages = await Promise.all(
        base64Images.map(async (base64Image) => {
          try {
            const imageBuffer = Buffer.from(base64Image, "base64");
            const blob = new Blob([imageBuffer], { type: "image/png" });

            const processedBlob = await removeBackground(blob);

            const arrayBuffer = await processedBlob.arrayBuffer();
            const resultBuffer = Buffer.from(arrayBuffer);

            return resultBuffer.toString("base64");
          } catch (error) {
            console.error("Error processing individual image:", error);
            console.error("Error details:", {
              errorName: error.name,
              errorMessage: error.message,
              errorStack: error.stack,
            });
            return base64Image;
          }
        })
      );

      return processedImages;
    } catch (error) {
      console.error("Error in batch background removal:", error);
      console.error("Full error details:", {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
      });
      return base64Images;
    }
  }
}

module.exports = new TitanImageService();
