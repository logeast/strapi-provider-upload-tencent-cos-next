# Strapi Provider Upload Tencent COS Next

This is a provider for the Strapi Framework that allows you to upload files directly to Tencent Cloud Object Storage (COS).

## Installation

```
npm install strapi-provider-upload-tencent-cos-next
```

## Configuration

To configure the provider, add the following code to `config/plugins.js`:

```js
module.exports = ({ env }) => ({
  // ...
  upload: {
    provider: "tencent-cos-next",
    providerOptions: {
      secretId: env("TENCENT_COS_SECRET_ID"),
      secretKey: env("TENCENT_COS_SECRET_KEY"),
      region: env("TENCENT_COS_REGION"),
      bucket: env("TENCENT_COS_BUCKET"),
      basePath: env("TENCENT_COS_BASE_PATH", "/"),
      baseOrigin: env(
        "TENCENT_COS_BASE_ORIGIN",
        "https://{Bucket}.cos.{Region}.myqcloud.com"
      ),
    },
  },
  // ...
});
```

You will also need to install the `cos-nodejs-sdk-v5` package as a dependency:

```
npm install cos-nodejs-sdk-v5
```

## Usage

The provider provides the following methods:

- **upload(file: File): Promise<File>**

  Uploads a file to the COS bucket. The `File` object should have the following properties:

  - `url`: The URL of the file. This property is not used by the provider and can be left empty.
  - `stream`: A Node.js readable stream containing the contents of the file.
  - `name`: The name of the file.
  - `mime`: The MIME type of the file.
  - `size`: The size of the file in bytes.

- **uploadStream(file: File): Promise<File>**

  Same as `upload`, but takes a stream instead of a buffer.

- **delete(file: File): Promise<File>**

  Deletes a file from the COS bucket. The `File` object should have the `url` property set to the URL of the file to be deleted.

- **checkFileSize(file: File, options: { sizeLimit: number }): void**

  Checks if a file exceeds a given size limit (in bytes). Throws an error if the file is too large.

- **getSignedUrl(file: File): Promise<{ url: string }>**

  Generates a signed URL for downloading a private file. This method is not used by the provider and always returns a public URL.

- **isPrivate(): boolean**

  Returns `false`, indicating that all uploaded files are public.

## License

This package is licensed under the MIT License.