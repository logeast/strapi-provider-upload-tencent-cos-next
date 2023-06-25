import COS from "cos-nodejs-sdk-v5";

interface File {
  url: string;
  stream: COS.UploadBody;
  name: string;
  mime: string;
  size: number;
  buffer?: Buffer;
}

interface InitOptions {
  secretId: string; // 在 COS 控制台获取的 SecretId
  secretKey: string; // 在 COS 控制台获取的 SecretKey
  region: string; // 存储桶所在地域
  bucket: string; // 存储桶名称
  basePath?: string; // 文件路径前缀，默认为根目录
  baseOrigin?: string; // 文件访问的基础域名，默认为 COS 默认域名
}

export default {
  init({
    secretId,
    secretKey,
    region,
    bucket,
    basePath = "/",
    baseOrigin = "https://{Bucket}.cos.{Region}.myqcloud.com",
  }: InitOptions) {
    const config = {
      SecretId: secretId,
      SecretKey: secretKey,
      Region: region,
    };

    const cosClient = new COS(config);

    const provider = {
      async upload(file: File) {
        const fileKey = `${basePath}${Date.now()}-${file.name}`;
        const result = await new Promise<{ url: string }>((resolve, reject) => {
          cosClient.putObject(
            {
              Bucket: bucket,
              Key: fileKey,
              Body: file.buffer as COS.UploadBody, // 使用类型断言绕过类型检查
              ContentType: file.mime,
              Region: region,
            },
            (err, data) => {
              if (err) {
                reject(err);
              } else {
                resolve({ url: data.Location });
              }
            }
          );
        });

        return { ...file, url: `${baseOrigin}/${fileKey}` };
      },

      async uploadStream(file: File) {
        const fileKey = `${basePath}${Date.now()}-${file.name}`;

        await new Promise<void>((resolve, reject) => {
          cosClient.putObject(
            {
              Bucket: bucket,
              Key: fileKey,
              Body: file.stream,
              ContentType: file.mime,
              Region: region,
            },
            (err, data) => {
              if (err) {
                reject(err);
              } else {
                file.url = `${baseOrigin}/${fileKey}`;
                resolve();
              }
            }
          );
        });

        return { ...file };
      },

      async delete(file: File) {
        const key = file.url.slice(file.url.lastIndexOf("/") + 1);

        await new Promise<void>((resolve, reject) => {
          cosClient.deleteObject(
            {
              Bucket: bucket,
              Key: key,
              Region: region,
            },
            (err, data) => {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            }
          );
        });

        // 删除后清空 URL
        return { ...file, url: "" };
      },

      checkFileSize(file: File, { sizeLimit }: { sizeLimit: number }) {
        if (file.size > sizeLimit) {
          throw Error(`文件大小不能超过 ${sizeLimit / 1024 / 1024}MB`);
        }
      },

      async getSignedUrl(file: File): Promise<{ url: string }> {
        const signedUrl = `${baseOrigin}${basePath}${file.url}`;
        return { url: signedUrl };
      },

      isPrivate() {
        return false;
      },
    };

    return provider;
  },
};
