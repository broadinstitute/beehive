import { ItemDetails } from "~/components/panel-structures/item-details";

export const UserGeneralDetails: React.FunctionComponent = () => (
  <ItemDetails subtitle="DSP DevOps Platform" title="Beehive/Sherlock Users">
    <p>
      Beehive and Sherlock work together to try to manage users automatically.
    </p>
    <p>
      DevOps's platform is behind Google's Identity-Aware Proxy (IAP). The
      ability to even send a network request into our platform is gated by IAP
      via Google Groups.
    </p>
    <p>
      Sherlock is the source-of-truth that backs our whole platform, so it pays
      attention to the Google accounts of users as they make requests and
      enforces permissions based on the individual's identity. When someone
      first makes a request to Sherlock, it will create a user entry for them
      automatically.
    </p>
    <p>
      Requests to Beehive typically get forwarded to Sherlock one way or
      another, so if you're reading this, you'll see your user at the top of the
      list to the right.
    </p>
    <p>
      Beehive also helps tell Sherlock about your GitHub account. This way, if
      you run a GitHub Action that contacts Sherlock, Sherlock can identify you
      via your GitHub account and will know who you are, instead of just
      whatever Google Service Account was used to talk through IAP.
    </p>
  </ItemDetails>
);
