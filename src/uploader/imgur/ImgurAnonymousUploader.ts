import { Readable } from "stream";
import { ImgurPostData } from "../../imgur/imgurResponseTypes";
import ImageUploader from "../ImageUploader";
import { handleImgurErrorResponse } from "../../imgur/ImgurClient";
import { requestUrl } from "obsidian";

export default class ImgurAnonymousUploader implements ImageUploader {
  private readonly clientId!: string;
  private readonly clientPassword!: string;
  private readonly clientUrl!: string;
  private readonly clientPath!: string;

  constructor(
    clientId: string,
    clientPassword: string,
    clientUrl: string,
    clientPath: string
  ) {
    this.clientId = clientId;
    this.clientPassword = clientPassword;
    this.clientUrl = clientUrl;
    this.clientPath = clientPath;
  }

  async upload(image: File): Promise<string> {
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
    const innerpath = `${this.clientPath}/${rndf()}.png`;
    const cPath = `remote.php/dav/files/${this.clientId}${innerpath}`;
    const bufx = await image.arrayBuffer();
    const fpUpl = await requestUrl({
      url: `${this.clientUrl}/${cPath}`,
      method: "PUT",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(this.clientId + ":" + this.clientPassword).toString(
            "base64"
          ),
      },
      body: bufx,
    });

    const lnkResp = await requestUrl({
      url: `${this.clientUrl}/ocs/v2.php/apps/files_sharing/api/v1/shares`,
      method: "POST",
      headers: {
        "OCS-APIRequest": "true",
        Authorization:
          "Basic " +
          Buffer.from(this.clientId + ":" + this.clientPassword).toString(
            "base64"
          ),
        "Content-Type": "application/json;charset=UTF-8",
        Accept: "application/json",
      },
      body: JSON.stringify({
        path: innerpath,
        shareType: 3,
      }),
    });
    return lnkResp.json.ocs.data.url + "/preview";
  }
}
