const {
  RekognitionClient,
  DetectLabelsCommand,
} = require("@aws-sdk/client-rekognition");
const awsConfig = require("./AwsConfig");
const Shirt = require("../models/Shirt.js");
class ImageSearchService {
  constructor() {
    this.rekognitionClient = awsConfig.getRekognitionClient();
  }

  async detectLabelsFromImage(imageBuffer) {
    try {
      const params = {
        Image: {
          Bytes: imageBuffer,
        },
        MaxLabels: 10,
        MinConfidence: 70,
      };

      const command = new DetectLabelsCommand(params);
      const response = await this.rekognitionClient.send(command);

      const detectedLabels = response.Labels.map((label) =>
        label.Name.toLowerCase()
      );

      return detectedLabels;
    } catch (error) {
      console.error("Error detecting labels:", error);
      throw error;
    }
  }

  async searchProductsByLabels(detectedLabels) {
    try {
      const query = {
        tag: {
          $in: detectedLabels,
        },
      };

      const products = await Shirt.find(query);
      return products;
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    }
  }

  async searchByImage(imageBuffer) {
    try {
      const detectedLabels = await this.detectLabelsFromImage(imageBuffer);

      const products = await this.searchProductsByLabels(detectedLabels);

      return {
        detectedLabels,
        products,
      };
    } catch (error) {
      console.error("Image search error:", error);
      throw error;
    }
  }
}

module.exports = new ImageSearchService();
