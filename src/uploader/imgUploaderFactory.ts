// import { IMGUR_ACCESS_TOKEN_LOCALSTORAGE_KEY, IMGUR_PLUGIN_CLIENT_ID } from 'src/imgur/constants'
// import AuthenticatedImgurClient from 'src/imgur/AuthenticatedImgurClient'
// import { ImgurPluginSettings } from 'src/ImgurPlugin'
// import UploadStrategy from 'src/UploadStrategy'
// import ImageUploader from './ImageUploader'
// import ImgurAnonymousUploader from './imgur/ImgurAnonymousUploader'
// import ImgurAuthenticatedUploader from './imgur/ImgurAuthenticatedUploader'

// function defaultAnonymousUploader(): ImageUploader {
//   return new ImgurAnonymousUploader(IMGUR_PLUGIN_CLIENT_ID)
import {
  IMGUR_ACCESS_TOKEN_LOCALSTORAGE_KEY,
  IMGUR_PLUGIN_CLIENT_ID,
  IMGUR_PLUGIN_CLIENT_PASSWORD,
  IMGUR_PLUGIN_CLIENT_URL,
  IMGUR_PLUGIN_CLIENT_PATH
} from "src/imgur/constants";
import ImgurClient from "src/imgur/ImgurClient";
import { ImgurPluginSettings } from "src/ImgurPlugin";
import UploadStrategy from "src/UploadStrategy";
import ImageUploader from "./ImageUploader";
import ImgurAnonymousUploader from "./imgur/ImgurAnonymousUploader";
import ImgurAuthenticatedUploader from "./imgur/ImgurAuthenticatedUploader";
import AuthenticatedImgurClient from "src/imgur/AuthenticatedImgurClient";

function defaultAnonymousUploader(): ImageUploader {
  return new ImgurAnonymousUploader(IMGUR_PLUGIN_CLIENT_ID, IMGUR_PLUGIN_CLIENT_PASSWORD, IMGUR_PLUGIN_CLIENT_URL, IMGUR_PLUGIN_CLIENT_PATH);
}

export default function buildUploaderFrom(
  settings: ImgurPluginSettings,
): ImageUploader | undefined {
  if (UploadStrategy.AUTHENTICATED_IMGUR.id === settings.uploadStrategy) {
    const accessToken = localStorage.getItem(IMGUR_ACCESS_TOKEN_LOCALSTORAGE_KEY)

    if (!accessToken) {
      return undefined
    }

    return new ImgurAuthenticatedUploader(new AuthenticatedImgurClient(accessToken))
  }
  if (settings.uploadStrategy === UploadStrategy.ANONYMOUS_IMGUR.id) {
    if (settings.clientId) {
      return new ImgurAnonymousUploader(settings.clientId, settings.clientPassword, settings.clientUrl, settings.clientPath);
    }
    return defaultAnonymousUploader()
  }
  throw Error('This line of code should never be reached')
}
