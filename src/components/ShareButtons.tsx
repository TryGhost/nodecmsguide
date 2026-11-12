import { XShareButton, XLegacyIcon, RedditShareButton, RedditLegacyIcon } from 'react-share';

interface ShareButtonsProps {
  shareUrl: string;
  shareText: string;
}

export default function ShareButtons({ shareUrl, shareText }: ShareButtonsProps) {
  return (
    <div className="share-buttons">
      <XShareButton url={shareUrl} text={shareText} aria-label="Share on X (Twitter)">
        <XLegacyIcon size={40} round bgStyle={{ fill: '#313d3e' }} />
      </XShareButton>
      <RedditShareButton url={shareUrl} shareTitle={shareText} aria-label="Share on Reddit">
        <RedditLegacyIcon size={40} round bgStyle={{ fill: '#313d3e' }} />
      </RedditShareButton>
    </div>
  );
}
