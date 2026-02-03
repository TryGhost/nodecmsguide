import {
  TwitterShareButton,
  TwitterIcon,
  RedditShareButton,
  RedditIcon,
} from 'react-share';

interface ShareButtonsProps {
  shareUrl: string;
  shareText: string;
}

export default function ShareButtons({ shareUrl, shareText }: ShareButtonsProps) {
  return (
    <div className="share-buttons">
      <TwitterShareButton url={shareUrl} title={shareText} aria-label="Share on X (Twitter)">
        <TwitterIcon size={40} round bgStyle={{ fill: '#313d3e' }} />
      </TwitterShareButton>
      <RedditShareButton url={shareUrl} title={shareText} aria-label="Share on Reddit">
        <RedditIcon size={40} round bgStyle={{ fill: '#313d3e' }} />
      </RedditShareButton>
    </div>
  );
}
