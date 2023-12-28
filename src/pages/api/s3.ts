import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { backend_env } from "./backend_env";

export const s3 = new S3Client({
  region: backend_env.REGION,
  credentials: {
    accessKeyId: backend_env.ACCESS_KEY_ID,
    secretAccessKey: backend_env.SECRET_ACCESS_KEY,
  },
});

export const uploadSqlite = async (data: Buffer) => {
  const command = new PutObjectCommand({
    Bucket: backend_env.BUCKET_NAME,
    Key: backend_env.FILE_NAME,
    Body: data,
  });
  return s3.send(command);
};

export const downloadSqlite = async () => {
  const command = new GetObjectCommand({
    Bucket: backend_env.BUCKET_NAME,
    Key: backend_env.FILE_NAME,
  });
  const data = await s3.send(command);
  if (!data.Body) throw new Error("no body");
  return data.Body.transformToByteArray();
};
