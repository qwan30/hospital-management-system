import { defaultPublicHomePageContent } from "../features/public-home/public-home.content";
import { PublicHomePage } from "../features/public-home/public-home-page";

export default function HomePage() {
  return <PublicHomePage content={defaultPublicHomePageContent} />;
}
