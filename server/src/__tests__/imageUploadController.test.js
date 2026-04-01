import { jest } from "@jest/globals";
import crypto from "crypto";

// Create mocks for the SDK
const mockSend = jest.fn().mockResolvedValue({});
const S3ClientMock = jest.fn().mockImplementation(() => ({
  send: mockSend
}));
const PutObjectCommandMock = jest.fn().mockImplementation((args) => args);

// Map the modules in jest
jest.unstable_mockModule("@aws-sdk/client-s3", () => ({
  S3Client: S3ClientMock,
  PutObjectCommand: PutObjectCommandMock,
}));

// Import AFTER mocking
const { uploadImageToS3 } = await import("../controllers/imageUploadController.js");

describe("ImageUploadController - AWS S3 functionality", () => {
    let mockFile;

    beforeAll(() => {
        // Set up env vars
        process.env.AWS_S3_BUCKET_NAME = "test-bucket";
        process.env.AWS_REGION = "us-east-1";
    });

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockFile = {
            originalname: "mock-image.png",
            mimetype: "image/png",
            buffer: Buffer.from("mock buffer data")
        };
    });

    it("should return null if no file is provided", async () => {
        const url = await uploadImageToS3(undefined, "users");
        expect(url).toBeNull();
    });

    it("should process the file buffer, execute PutObject, and return the correct S3 URL", async () => {
        // Spy on crypto.randomBytes 
        const cryptoSpy = jest.spyOn(crypto, "randomBytes").mockReturnValue(Buffer.from("1234567890abcdef1234567890abcdef", "hex"));
        
        // Mock Date.now
        const dateSpy = jest.spyOn(Date, "now").mockReturnValue(10000);

        const folder = "testFolder";
        const expectedFilename = `${folder}/10000-1234567890abcdef1234567890abcdef.png`;
        const expectedUrl = `https://test-bucket.s3.us-east-1.amazonaws.com/${expectedFilename}`;

        const url = await uploadImageToS3(mockFile, folder);

        // Verify PutObjectCommand
        expect(PutObjectCommandMock).toHaveBeenCalledWith({
            Bucket: "test-bucket",
            Key: expectedFilename,
            Body: mockFile.buffer,
            ContentType: mockFile.mimetype
        });

        // Verify the formatted URL matches expectations
        expect(url).toBe(expectedUrl);

        cryptoSpy.mockRestore();
        dateSpy.mockRestore();
    });

    it("should throw an error if the AWS send connection fails", async () => {
        // Using mockRejectedValueOnce directly on our mockSend reference
        mockSend.mockRejectedValueOnce(new Error("AWS upload failed"));

        await expect(uploadImageToS3(mockFile, "artworks")).rejects.toThrow("Failed to upload image to S3");
        expect(mockSend).toHaveBeenCalled();
    });
});
