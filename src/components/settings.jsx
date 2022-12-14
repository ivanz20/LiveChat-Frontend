import { createClient, createMicrophoneAndCameraTracks } from "agora-rtc-react";

const appId = "a78db640a91846cd8fd5a26f0bd7c683";
const token =
  "007eJxTYLi/1vd5RJsEr/o1Me7vOUzzK6S5HVZ7Lah2MZnx5tmzV0IKDInmFilJZiYGiZaGFiZmySkWaSmmiUZmaQZJKebJZhbGRb+nJzcEMjJsnLCfkZEBAkF8FobcxMw8BgYAEVcfjA==";

export const config = { mode: "rtc", codec: "vp8", appId: appId, token: token };
export const useClient = createClient(config);
export const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();
export const channelName = "main";
