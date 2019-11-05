import React from 'react'

const Footer = () => (
  <div>
    <div className="footer">
      <div className="footer-container">
        <h3>NodeCMS.guide is hosted and maintained by <strong><a href="https://ghost.org">Ghost</a></strong>, a fiercely independent platform for professional publishers.</h3>
      </div>
      <div className="postscript">
        Ghost Foundation © {new Date().getFullYear()}
      </div>
    </div>
  </div>
)

export default Footer
