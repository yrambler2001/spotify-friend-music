import config from 'config';
import got from 'got';
import { groupBy, sortBy } from 'lodash';
import { TokenModel, TimestampModel, SongLogModel, UserModel, AlbumModel, ArtistModel, ContextModel, SongModel } from 'models';

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

    const [buddy, meCurrentlyListening, me] = await Promise.all(
      ['https://spclient.wg.spotify.com/presence-view/v1/buddylist', 'https://api.spotify.com/v1/me/player/currently-playing', 'https://api.spotify.com/v1/me'].map((url) =>
        (async () => {
          const { body } = await got(url, { headers: { authorization: `Bearer ${token}` } });
          return body ? JSON.parse(body) : null;
        })(),
      ),
    );

    const { friends } = buddy;
    const friendsWithMe = [...friends];
    if (meCurrentlyListening) {
      const transformedMe = {
        timestamp: meCurrentlyListening?.timestamp,
        track: {
          ...meCurrentlyListening?.item,
          artist: meCurrentlyListening?.item?.artists?.[0],
          context: meCurrentlyListening?.context || meCurrentlyListening?.item?.album,
          imageUrl: sortBy(meCurrentlyListening?.item?.album?.images, 'height').reverse()[0]?.url,
        },
        user: { imageUrl: sortBy(me?.images, 'height').reverse()[0]?.url, name: me?.display_name, uri: me?.uri },
      };
      friendsWithMe.push(transformedMe);
    }
    await this.processResult(friendsWithMe);
  }

  async processResult(friends) {
    const opsBackground = [];
    const promises = [];
    const songLogOps = [];
    const callbacks = [];
    friends.forEach((friend) => {
      const { backgroundOps, SongLogOp, findSongLog, getTimestampOp } = this.processFriend({ friend });
      opsBackground.push(...backgroundOps);
      songLogOps.push(SongLogOp);
      callbacks.push({ findSongLog, getTimestampOp });
    });
    const songLogOpPromise = SongLogModel.bulkWrite(songLogOps);
    const opsGroupedByModel = groupBy(opsBackground, 'model.modelName');
    promises.push(songLogOpPromise);
    promises.push(...Object.values(opsGroupedByModel).map((opsInOneModel) => opsInOneModel[0].model.bulkWrite(opsInOneModel.map((op) => op.op))));
    await songLogOpPromise;
    const currentSongLogs = await SongLogModel.find({ $or: callbacks.map((callback) => callback.findSongLog) }).lean();
    const currentSongLogsMap = {};
    currentSongLogs.forEach(({ userUri, songUri, _id }) => {
      currentSongLogsMap[`${userUri}_${songUri}`] = _id;
    });
    promises.push(TimestampModel.bulkWrite(callbacks.map((callback) => callback.getTimestampOp(currentSongLogsMap))));
    await Promise.all(promises);
  }

  processFriend({ friend }) {
    const { timestamp, track, user } = friend;
    const { album, artist, context, imageUrl: songImageUrl, name: songName, uri: songUri } = track;
    const { imageUrl: userImageUrl, name: userName, uri: userUri } = user;
    const { name: albumName, uri: albumUri } = album;
    const { name: artistName, uri: artistUri } = artist;
    const { name: contextName, uri: contextUri } = context;
    const AlbumOp = { updateOne: { filter: { _id: albumUri }, update: { $setOnInsert: { _id: albumUri }, $set: { name: albumName } }, upsert: true } };
    const ArtistOp = { updateOne: { filter: { _id: artistUri }, update: { $setOnInsert: { _id: artistUri }, $set: { name: artistName } }, upsert: true } };
    const ContextOp = { updateOne: { filter: { _id: contextUri }, update: { $setOnInsert: { _id: contextUri }, $set: { name: contextName } }, upsert: true } };
    const UserOp = { updateOne: { filter: { _id: userUri }, update: { $setOnInsert: { _id: userUri }, $set: { name: userName, imageUrl: userImageUrl } }, upsert: true } };
    const SongOp = { updateOne: { filter: { _id: songUri }, update: { $setOnInsert: { _id: songUri }, $set: { name: songName, imageUrl: songImageUrl, albumUri, artistUri, contextUri } }, upsert: true } };
    const SongLogOp = { updateOne: { filter: { songUri, userUri }, update: { $set: { songUri, userUri } }, upsert: true } };
    const findSongLog = { songUri, userUri };
    const getTimestampOp = (songLogs) => {
      const songLogId = songLogs[`${userUri}_${songUri}`];
      return { updateOne: { filter: { songLogId, timestamp: new Date(timestamp) }, update: { $set: { songLogId, timestamp: new Date(timestamp) } }, upsert: true } };
    };
    const backgroundOps = [
      { model: AlbumModel, op: AlbumOp },
      { model: ArtistModel, op: ArtistOp },
      { model: ContextModel, op: ContextOp },
      { model: UserModel, op: UserOp },
      { model: SongModel, op: SongOp },
    ];
    return {
      backgroundOps,
      SongLogOp,
      findSongLog,
      getTimestampOp,
    };
  }
}
export default new SpotifySongsService();
