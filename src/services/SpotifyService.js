import { TimestampModel, UserModel } from 'models';

class SpotifyService {
  spotifySongsUsersList() {
    return UserModel.find({}).lean();
  }

  spotifyUser({ userUri }) {
    return UserModel.findOne({ _id: userUri }).lean();
  }

  async spotifySongsByUser({ startDate, endDate, userUri }) {
    const songs = await TimestampModel.collection
      .aggregate(
        [
          (startDate || endDate) && {
            $match: {
              timestamp: {
                ...(startDate && { $gte: startDate }),
                ...(endDate && { $lte: endDate }),
              },
            },
          },
          {
            $lookup: {
              from: 'songlogs',
              localField: 'songLogId',
              foreignField: '_id',
              as: 'songLogs',
            },
          },
          {
            $addFields: {
              songLog: {
                $arrayElemAt: ['$songLogs', 0],
              },
            },
          },
          {
            $match: {
              'songLog.userUri': userUri,
            },
          },
          {
            $lookup: {
              from: 'songs',
              localField: 'songLog.songUri',
              foreignField: '_id',
              as: 'songs',
            },
          },
          {
            $addFields: {
              song: {
                $arrayElemAt: ['$songs', 0],
              },
            },
          },
          {
            $lookup: {
              from: 'artists',
              localField: 'song.artistUri',
              foreignField: '_id',
              as: 'artists',
            },
          },
          {
            $addFields: {
              artist: {
                $arrayElemAt: ['$artists', 0],
              },
            },
          },
          {
            $group: {
              _id: '$song._id',
              name: {
                $first: '$song.name',
              },
              albumUri: {
                $first: '$song.albumUri',
              },
              artistUri: {
                $first: '$song.artistUri',
              },
              imageUrl: {
                $first: '$song.imageUrl',
              },
              artistName: {
                $first: '$artist.name',
              },
              timestamps: {
                $push: '$$ROOT.timestamp',
              },
            },
          },
        ].filter(Boolean),
      )
      .toArray();
    const value = songs.map((s) => ({ ...s, _id: `${s._id}_${endDate}_${startDate}_${userUri}`, song: { ...s, artistName: s.artistName } }));
    // debugger;
    return value;
  }
}
export default new SpotifyService();
