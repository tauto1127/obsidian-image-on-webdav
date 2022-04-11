import NextcloudClient from "nextcloud-link";
import { Readable } from "stream";
import { ImgurPostData } from "../../imgur/imgurResponseTypes";
import ImageUploader from "../ImageUploader";
import { handleImgurErrorResponse } from "../../imgur/ImgurClient";


export default class ImgurAnonymousUploader implements ImageUploader {
  private readonly clientId!: string;
  private readonly clientPassword!: string;
  private readonly clientUrl!: string;
  private readonly clientPath!: string;

  constructor(clientId: string, clientPassword: string, clientUrl: string, clientPath: string) {
    this.clientId = clientId;
    this.clientPassword = clientPassword;
    this.clientUrl = clientUrl;
    this.clientPath = clientPath;
  }

  async upload(image: File): Promise<string> {
    const client = new NextcloudClient({
      url: this.clientUrl,
      password: this.clientPassword,
      username: this.clientId,
    });

    const vbuf = await image.arrayBuffer();
    const newStream = new Readable({
      read() {
        this.push(vbuf);
      },
    });
    const rndf = () => {
      const lst =
        "abdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY0123456789";
      return Array(15)
        .fill(1)
        .map(
          () =>
            lst[parseInt((Math.random() * 1000).toString()) % (lst.length - 1)]
        )
        .join("");
    };
    const cPath = `${this.clientPath}/${rndf()}.png`;
    const resp = await client.uploadFromStream(cPath, newStream);
    const lnkResp = await client.shares.add(cPath, 3);
    return lnkResp.url + "/preview";
  }
}
