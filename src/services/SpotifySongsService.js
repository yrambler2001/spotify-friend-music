import config from 'config';
import got from 'got';
import { isEqual } from 'lodash';
import { TokenModel, BuddyLogModel } from 'models';
import { brotliCompress, brotliDecompress } from 'zlib';

class SpotifySongsService {
  async getNewToken({ spDcCookie }) {
    const res = await got('https://open.spotify.com/get_access_token?reason=transport&productType=web_player', {
      headers: {
        Cookie: `sp_dc=${spDcCookie}`,
      },
    });
    const { accessToken: token, accessTokenExpirationTimestampMs: expires } = JSON.parse(res.body);

    return { token, expires };
  }

  async update() {
    let { token, expires } = (await TokenModel.findOne()) || {};

    if (!token || (expires && expires - new Date() < 1000 * 60 * 5)) {
      const newToken = await this.getNewToken({ spDcCookie: config.spDcCookie });
      token = newToken.token;
      expires = newToken.expires;
      await TokenModel.updateOne({}, { token, expires }, { upsert: true });
    }

    const buddy = await got('https://spclient.wg.spotify.com/presence-view/v1/buddylist', {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    const prev = await BuddyLogModel.findOne({}, {}, { sort: { _id: -1 } });
    const prevDecompressed = prev?.data?.buffer && (await new Promise((res) => brotliDecompress(prev.data.buffer, (err, r) => res(String(r)))));
    if (isEqual(prevDecompressed, buddy.body)) {
      console.log('same');
      return;
    }
    const buffer = await new Promise((res) => brotliCompress(buddy.body, (err, buf) => res(buf)));
    await new BuddyLogModel({ data: buffer }).save();
  }
}
export default new SpotifySongsService();
