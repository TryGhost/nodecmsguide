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
      <TwitterShareButton url={shareUrl} title={shareText}>
        <TwitterIcon size={40} round bgStyle={{ fill: '#313d3e' }} />
      </TwitterShareButton>
      <RedditShareButton url={shareUrl} title={shareText}>
        <RedditIcon size={40} round bgStyle={{ fill: '#313d3e' }} />
      </RedditShareButton>

      <style>{`
        .share-buttons {
          display: flex;
          justify-content: center;
          gap: 8px;
        }
        .share-buttons button {
          cursor: pointer;
        }
        .share-buttons button:hover circle {
          transition: fill 0.1s ease;
        }
        .share-buttons button:first-child:hover circle {
          fill: #1da1f2 !important;
        }
        .share-buttons button:last-child:hover circle {
          fill: #ff4500 !important;
        }
      `}</style>
    </div>
  );
}
