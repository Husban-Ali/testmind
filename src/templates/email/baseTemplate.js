// // import roleSignature from './roleSignature.js'
// // import { COMPANY_LOGO_URL, COMPANY_NAME, FRONTEND_URL } from '../../config/env.js'

// // export default function baseTemplate({ title, content,sender, prettyRole }) {
// //   return `
// //   <!DOCTYPE html>
// //   <html lang="en">
// //   <head>
// //     <meta charset="UTF-8" />
// //     <title>${escapeHtml(title || COMPANY_NAME)}</title>
// //     <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
// //     <style>
// //       body {
// //         margin: 0;
// //         padding: 0;
// //         background: #f9fafb;
// //         font-family: "Segoe UI", Roboto, Arial, sans-serif;
// //         color: #2b2b2b;
// //       }

// //       .wrapper {
// //         width: 100%;
// //         padding: 30px 0;
// //       }

// //       .container {
// //         max-width: 640px;
// //         margin: 0 auto;
// //         background: #ffffff;
// //         border-left: 6px solid #b79a6b; /* GOLD SIDE BORDER */
// //         border-right: 6px solid #b79a6b; /* BOTH SIDES */
// //         box-shadow: 0 4px 15px rgba(0,0,0,0.06);
// //         overflow: hidden;
// //         position: relative;
// //         border-radius: 4px;
// //       }

// //       /* Radiant background watermark */
// //       .container::before {
// //         content: "R";
// //         position: absolute;
// //         top: 25%;
// //         left: 35%;
// //         font-size: 340px;
// //         font-weight: 900;
// //         color: rgba(0,0,0,0.02);
// //         z-index: 0;
// //         user-select: none;
// //       }

// //       .content {
// //         position: relative;
// //         z-index: 2;
// //         padding: 30px;
// //         font-size: 15px;
// //         line-height: 1.6;
// //       }

// //       .divider {
// //         height: 1px;
// //         background: #ececec;
// //         margin: 30px 0;
// //       }

// //       /* Signature Section */
// //       .signature {
// //         position: relative;
// //         z-index: 2;
// //         padding: 20px 30px 40px;
// //       }

// //       .signature p {
// //         margin: 0;
// //         line-height: 1.5;
// //       }

// //       .name {
// //         font-weight: 700;
// //         font-size: 15px;
// //         color: #000000;
// //       }

// //       .role {
// //         font-size: 13px;
// //         color: #333333;
// //       }

// //       .company {
// //         color: #b79a6b;
// //         font-weight: 600;
// //       }

// //       .footer-logo {
// //         width: 130px;
// //         margin: 15px 0 10px;
// //       }

// //       .contact-row {
// //         display: flex;
// //         align-items: center;
// //         gap: 8px;
// //         font-size: 13px;
// //         color: #333333;
// //         margin: 4px 0;
// //       }

// //       .contact-row img {
// //         width: 14px;
// //         opacity: 0.85;
// //       }

// //       .socials {
// //         display: flex;
// //         gap: 10px;
// //         margin-top: 10px;
// //       }

// //       .socials a img {
// //         width: 20px;
// //         height: 20px;
// //         opacity: 0.9;
// //         transition: opacity 0.3s ease;
// //       }

// //       .socials a img:hover {
// //         opacity: 1;
// //       }

// //       @media screen and (max-width: 680px) {
// //         .container { border-radius: 0; }
// //         .content, .signature { padding: 20px; }
// //       }
// //     </style>
// //   </head>
// //   <body>
// //     <div class="wrapper">
// //       <div class="container">
// //         <div class="content">
// //           ${content}

// //           <div class="divider"></div>

// //           <!-- Signature -->
// //           <div class="signature">
// //             <p>Best Regards,</p>
// //             <p class="name">${escapeHtml(sender.fullName)}</p>
// //             <p class="role">${escapeHtml(prettyRole(sender.role))}, <span class="company">${COMPANY_NAME}</span></p>

// //             <img src="${COMPANY_LOGO_URL}" alt="${escapeHtml(COMPANY_NAME)} Logo" class="footer-logo"/>

// //             <div class="contact-row">
// //               <img src="https://img.icons8.com/ios-filled/50/b79a6b/phone.png" alt="phone"/> 
// //               <span>+92-21-3460-0107</span>
// //             </div>

// //             <div class="contact-row">
// //               <img src="https://img.icons8.com/ios-filled/50/b79a6b/secured-letter.png" alt="email"/> 
// //               <a href="mailto:info@radiantsolutionsrs.com" style="color:#333;text-decoration:none;">info@radiantsolutionsrs.com</a>
// //             </div>

// //             <div class="contact-row">
// //               <img src="https://img.icons8.com/ios-filled/50/b79a6b/domain.png" alt="website"/> 
// //               <a href="https://${FRONTEND_URL}" target="_blank" style="color:#333;text-decoration:none;">${FRONTEND_URL}</a>
// //             </div>

// //             <div class="socials">
// //               <a href="https://instagram.com" target="_blank"><img src="https://img.icons8.com/ios-filled/50/4a7f7e/instagram-new.png" alt="instagram" /></a>
// //               <a href="https://linkedin.com" target="_blank"><img src="https://img.icons8.com/ios-filled/50/4a7f7e/linkedin.png" alt="linkedin" /></a>
// //               <a href="https://facebook.com" target="_blank"><img src="https://img.icons8.com/ios-filled/50/4a7f7e/facebook.png" alt="facebook" /></a>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   </body>
// //   </html>
// //   `
// // }

// import { COMPANY_LOGO_URL, COMPANY_NAME, FRONTEND_URL, MAIL_FROM_NAME, MAIL_FROM_EMAIL } from '../../config/env.js'
// import roleSignature from './roleSignature.js'

// export default function baseTemplate({ title, content, sender, prettyRole }) {
//   return `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8" />
//     <title>${escapeHtml(title || COMPANY_NAME)}</title>
//     <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
//     <style>
//       body {
//         margin: 0;
//         padding: 0;
//         background: #f9fafb;
//         font-family: "Segoe UI", Roboto, Arial, sans-serif;
//         color: #2b2b2b;
//       }

//       .wrapper {
//         width: 100%;
//         padding: 30px 0;
//       }

//       .container {
//         max-width: 640px;
//         margin: 0 auto;
//         background: #ffffff;
//         border: 6px solid #0fa3a3; /* TEAL BORDER ON ALL SIDES */
//         box-shadow: 0 6px 22px rgba(15,163,163,0.06);
//         overflow: hidden;
//         position: relative;
//         border-radius: 6px;
//       }

//       .container::before {
//         content: "${escapeHtml((COMPANY_NAME || '').charAt(0) || 'R')}";
//         position: absolute;
//         top: 22%;
//         left: 32%;
//         font-size: 340px;
//         font-weight: 900;
//         color: rgba(15,163,163,0.06);
//         z-index: 0;
//         user-select: none;
//       }

//       .content {
//         position: relative;
//         z-index: 2;
//         padding: 30px;
//         font-size: 15px;
//         line-height: 1.6;
//       }

//       .divider {
//         height: 1px;
//         background: #ececec;
//         margin: 30px 0;
//       }

//       .signature {
//         position: relative;
//         z-index: 2;
//         padding: 20px 30px 40px;
//       }

//       .name {
//         font-weight: 800;
//         font-size: 16px;
//         color: #0b3b3b;
//       }

//       .role {
//         font-size: 13px;
//         color: #0fa3a3; /* teal accent for role */
//         font-weight: 600;
//       }

//       .company {
//         color: #0fa3a3;
//         font-weight: 700;
//       }

//       .footer-logo {
//         width: 120px;
//         margin: 12px 0 8px;
//       }

//       .contact-row {
//         display: flex;
//         align-items: center;
//         gap: 8px;
//         font-size: 13px;
//         color: #333333;
//         margin: 4px 0;
//       }

//       .socials {
//         display: flex;
//         gap: 10px;
//         margin-top: 10px;
//       }

//       .socials a img {
//         width: 20px;
//         height: 20px;
//         opacity: 0.9;
//         transition: opacity 0.3s ease;
//       }

//       .socials a img:hover {
//         opacity: 1;
//       }

//       @media screen and (max-width: 680px) {
//         .container { border-radius: 0; }
//         .content, .signature { padding: 20px; }
//       }
//     </style>
//   </head>
//   <body>
//     <div class="wrapper">
//       <div class="container">
//         <div class="content">
//           ${content}

//           <div class="divider"></div>

//           <!-- Signature block -->
//           <div class="signature">
//             ${roleSignature({ sender: sender || { fullName: MAIL_FROM_NAME || COMPANY_NAME, email: MAIL_FROM_EMAIL || '' } })}

//             <!-- Contact details (phone / email / website) -->
//             <div style="margin-top:12px">
//               <div class="contact-row">
//                 <img src="https://img.icons8.com/ios-filled/50/0fa3a3/phone.png" alt="phone"/>
//                 <span>+92-21-3460-0107</span>
//               </div>

//               <div class="contact-row">
//                 <img src="https://img.icons8.com/ios-filled/50/0fa3a3/secured-letter.png" alt="email"/>
//                 <a href="mailto:info@radiantsolutionsrs.com" style="color:#0b3b3b;text-decoration:none;">info@radiantsolutionsrs.com</a>
//               </div>

//               <div class="contact-row">
//                 <img src="https://img.icons8.com/ios-filled/50/0fa3a3/domain.png" alt="website"/>
//                 <a href="${FRONTEND_URL ? `https://${FRONTEND_URL}` : '#'}" target="_blank" style="color:#0b3b3b;text-decoration:none;">${FRONTEND_URL || COMPANY_NAME}</a>
//               </div>

//               <div class="socials">
//                 <a href="https://instagram.com" target="_blank"><img src="https://img.icons8.com/ios-filled/50/0fa3a3/instagram-new.png" alt="instagram"/></a>
//                 <a href="https://linkedin.com" target="_blank"><img src="https://img.icons8.com/ios-filled/50/0fa3a3/linkedin.png" alt="linkedin"/></a>
//                 <a href="https://facebook.com" target="_blank"><img src="https://img.icons8.com/ios-filled/50/0fa3a3/facebook.png" alt="facebook"/></a>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   </body>
//   </html>
//   `
// }

// function escapeHtml(str = '') {
//   return String(str).replace(/[&<>'"]/g, c => ({
//     '&': '&amp;',
//     '<': '&lt;',
//     '>': '&gt;',
//     "\'": '&#39;',
//     '"': '&quot;'
//   }[c]))
// }
import { COMPANY_LOGO_URL, COMPANY_NAME, FRONTEND_URL, MAIL_FROM_NAME, MAIL_FROM_EMAIL } from '../../config/env.js'
import roleSignature from './roleSignature.js'

export default function baseTemplate({ title, content, sender, prettyRole }) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(title || COMPANY_NAME)}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <style>
      body {
        margin: 0;
        padding: 0;
        background: #f9fafb;
        font-family: "Segoe UI", Roboto, Arial, sans-serif;
        color: #2b2b2b;
      }

      .wrapper {
        width: 100%;
        padding: 30px 0;
      }

      .container {
        max-width: 640px;
        margin: 0 auto;
        background: #ffffff;
        border: 6px solid #0fa3a3; /* TEAL BORDER */
        box-shadow: 0 6px 22px rgba(15,163,163,0.06);
        overflow: hidden;
        position: relative;
        border-radius: 6px;
      }

      .container::before {
        content: "${escapeHtml((COMPANY_NAME || '').charAt(0) || 'R')}";
        position: absolute;
        top: 22%;
        left: 32%;
        font-size: 340px;
        font-weight: 900;
        color: rgba(15,163,163,0.05);
        z-index: 0;
        user-select: none;
      }

      .content {
        position: relative;
        z-index: 2;
        padding: 30px;
        font-size: 15px;
        line-height: 1.6;
      }

      .divider {
        height: 1px;
        background: #ececec;
        margin: 30px 0;
      }

      .signature {
        position: relative;
        z-index: 2;
        padding: 20px 30px 40px;
      }

      .name {
        font-weight: 800;
        font-size: 16px;
        color: #0b3b3b;
      }

      .role {
        font-size: 13px;
        color: #0fa3a3;
        font-weight: 600;
      }

      .company {
        color: #0fa3a3;
        font-weight: 700;
      }

      .footer-logo {
        width: 120px;
        margin: 12px 0 8px;
      }

      /* Contact details styling */
      .contact-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13.5px;
        color: #0b3b3b;
        margin: 3px 0;
        line-height: 1.4;
      }

      .contact-row img {
        width: 13px; /* smaller icon size */
        height: 13px;
        opacity: 0.85;
        vertical-align: middle;
      }

      .contact-row a {
        color: #0b3b3b;
        text-decoration: none;
      }

      .contact-row a:hover {
        text-decoration: underline;
      }

      .socials {
        display: flex;
        gap: 8px;
        margin-top: 10px;
      }

      .socials a img {
        width: 18px;
        height: 18px;
        opacity: 0.9;
        transition: opacity 0.3s ease;
      }

      .socials a img:hover {
        opacity: 1;
      }

      @media screen and (max-width: 680px) {
        .container { border-radius: 0; }
        .content, .signature { padding: 14px; }
        .footer-logo { width: 100px; }
        .name { font-size: 15px; }
        .role { font-size: 13px; }

        /* Make signature table stack vertically on narrow screens */
        .signature table { width: 100% !important; }
        .signature td { display: block !important; width: 100% !important; padding: 6px 0 !important; text-align: center !important; }
        .signature td.sig-left img { margin: 0 auto !important; }

        /* Reduce watermark impact on small screens */
        .container::before { display: none; }
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="content">
          ${content}

          <div class="divider"></div>

          <!-- Signature block -->
          <div class="signature">
            ${roleSignature({ sender: sender || { fullName: MAIL_FROM_NAME || COMPANY_NAME, email: MAIL_FROM_EMAIL || '' } })}

            <div style="margin-top:12px">
              <div class="contact-row">
                <img src="https://img.icons8.com/ios-filled/50/0fa3a3/phone.png" alt="phone"/>
                <span>+92-21-3460-0107</span>
              </div>

              <div class="contact-row">
                <img src="https://img.icons8.com/ios-filled/50/0fa3a3/secured-letter.png" alt="email"/>
                <a href="mailto:info@radiantsolutionsrs.com">info@radiantsolutionsrs.com</a>
              </div>

              <div class="contact-row">
                <img src="https://img.icons8.com/ios-filled/50/0fa3a3/domain.png" alt="website"/>
                <a href="${FRONTEND_URL ? `https://${FRONTEND_URL}` : '#'}" target="_blank">${FRONTEND_URL || COMPANY_NAME}</a>
              </div>

              <div class="socials">
                <a href="https://instagram.com" target="_blank"><img src="https://img.icons8.com/ios-filled/50/0fa3a3/instagram-new.png" alt="instagram"/></a>
                <a href="https://linkedin.com" target="_blank"><img src="https://img.icons8.com/ios-filled/50/0fa3a3/linkedin.png" alt="linkedin"/></a>
                <a href="https://facebook.com" target="_blank"><img src="https://img.icons8.com/ios-filled/50/0fa3a3/facebook.png" alt="facebook"/></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `
}

function escapeHtml(str = '') {
  return String(str).replace(/[&<>'"]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[c]))
}
