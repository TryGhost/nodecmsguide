import React from 'react'

const Footer = () => (
  <div>
    <div className="footer">
      <div className="footer-container">
        <h3>NodeCMS.guide is hosted and maintained by <a href="https://ghost.org">Ghost</a>, the perfect way to deploy your JAMstack sites and apps.</h3>
      </div>
      <div className="postscript">
        Ghost Foundation © {new Date().getFullYear()}
      </div>
    </div>
  </div>
)

export default Footer
