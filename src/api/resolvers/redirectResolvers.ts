import { ArtistRedirect } from "../../database/entity/ArtistRedirect";

export default {
  queries: {
    async artistRedirects(_: any, args: { artistName: string }) {
      return await ArtistRedirect.find({ to: args.artistName });
    },
  },
};
