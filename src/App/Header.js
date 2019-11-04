import React from 'react'
import { Link, RouteData, Head } from 'react-static'
import styled from 'styled-components'
import {
  TwitterShareButton,
  TwitterIcon,
  RedditShareButton,
  RedditIcon,
} from 'react-share'
import GitHubCorner from 'react-github-corner'
import logo from 'Images/headless-logo.svg'

const ShareButtonWrapper = styled.div`
  display: flex;
  justify-content: center;

  > * {
    margin: 0 4px;
  }
`

const ShareButton = styled(({ type, url, className, text }) => {
  const components = {
    twitter: { Button: TwitterShareButton, Icon: TwitterIcon },
    reddit: { Button: RedditShareButton, Icon: RedditIcon },
  }
  const { Button, Icon } = components[type]

  return (
    <Button url={url} title={text} className={className}>
      <Icon size={40} round iconBgStyle={{ fill: '#313d3e' }} />
    </Button>
  )
})`
  cursor: pointer;

  &:hover {
    circle {
      transition: fill 0.1s ease;
      fill: ${({ color }) => color} !important;
    }
  }
`

// swyx: temporary insert jamstack conf banner
const PromoBanner = ({ className }) => (
  <div className={className}>
    <p>Insert promotional info here</p>
  </div>
)
const PromoBannerStyled = styled(PromoBanner)`
  background-color: #000;
  color: #fff;
  display: block;
  text-align: center;
  z-index: 200;
  position: fixed;
  margin: 0;
  padding: 0;
  width: 100%;
  p {
    margin: 0;
    padding-top: 0.6em;
    padding-bottom: 0.6em;
  }
  a:link,
  a:visited {
    color: #00c7b7;
  }
`
// temporary insert jamstack conf banner

const Header = () => (
  <RouteData
    render={({ title, shareUrl, shareText }) => (
      <div>
        <Head>
          <title>
            {`${
              title
                ? `${title} | nodeCMS`
              : "nodeCMS | Top Content Management Systems for JAMstack sites"
            }`}
          </title>
        </Head>
        <div className="hero">
          <h1>
            <Link to="/" title="nodeCMS">
              <img alt="nodeCMS" src={logo} />
            </Link>
          </h1>
          <h2>A List of Node.js content management systems</h2>

          <ShareButtonWrapper>
            <ShareButton
              type="twitter"
              url={shareUrl}
              color="#1da1f2"
              text={shareText}
            />
            <ShareButton
              type="reddit"
              url={shareUrl}
              color="#ff4500"
              text={shareText}
            />
          </ShareButtonWrapper>

          <GitHubCorner
            href="https://github.com/tryghost/nodecmsguide"
            bannerColor="#24292e"
            size="90"
            svgStyle={{ zIndex: 300, mixBlendMode: 'multiply' }}
          />
        </div>
        <div className="navbar">
          <div className="container">
            <div className="menu left">
              <ul>
                <li>
                  <Link to="/contribute">Contribute</Link>
                </li>
                <li>
                  <a
                    href="https://nodejs.org/en/about/"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    What is Node.js?
                  </a>
                </li>
                <li>
                  <Link to="/contact">Contact</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )}
  />
);

export default Header
