import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "./env";

export const s3 = new S3Client({
  region: env.REGION,
  credentials: {
    accessKeyId: env.ACCESS_KEY_ID,
    secretAccessKey: env.SECRET_ACCESS_KEY,
  },
});

export const upload = async (data: PutObjectCommand["input"]["Body"]) => {
  const command = new PutObjectCommand({
    Bucket: env.BUCKET_NAME,
    Key: env.FILE_NAME,
    Body: data,
  });
  return s3.send(command);
};

export const download = async () => {
  const command = new GetObjectCommand({
    Bucket: env.BUCKET_NAME,
    Key: env.FILE_NAME,
  });
  return s3.send(command);
};
