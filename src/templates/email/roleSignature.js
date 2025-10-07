// import { COMPANY_NAME, COMPANY_LOGO_URL } from '../../config/env.js'

// export default function roleSignature ({ sender }) {
//   const prettyRole = {
//     IT_MANAGER: 'IT Manager',
//     CEO: 'Chief Executive Officer',
//     EMPLOYEE: 'Staff'
//   }[sender.role] || sender.role

//   return `
//     <table cellpadding="0" cellspacing="0" style="margin-top:8px;">
//       <tr>
//         <td style="vertical-align:top;padding-right:12px;">
//           <img src="${COMPANY_LOGO_URL}" alt="${escapeHtml(COMPANY_NAME)}" style="width:88px;height:auto;border-radius:6px;display:block" />
//         </td>
//         <td style="vertical-align:top">
//           <div style="font-weight:700;font-size:15px;color:#10263a">${escapeHtml(sender.fullName)}</div>
//           <div style="color:#425d73;font-size:13px;margin-top:4px">${escapeHtml(prettyRole)}</div>
//           <div style="color:#6d8092;font-size:13px;margin-top:8px">Email: <a href="mailto:${escapeHtml(sender.email)}" style="color:#3366cc;text-decoration:none">${escapeHtml(sender.email)}</a></div>
//         </td>
//       </tr>
//     </table>
//   `
// }

// function escapeHtml (str = '') {
//   return String(str).replace(/[&<>"']/g, c => ({
//     '&': '&amp;',
//     '<': '&lt;',
//     '>': '&gt;',
//     '"': '&quot;',
//     "'": '&#39;'
//   }[c]))
// }


import { COMPANY_NAME, COMPANY_LOGO_URL } from '../../config/env.js'

export default function roleSignature({ sender = {} } = {}) {
  const name = sender.fullName || COMPANY_NAME || 'Team'
  const email = sender.email || ''
  const roleKey = sender.role || ''

  const prettyRole = {
    IT_MANAGER: 'IT Manager',
    CEO: 'CEO',
    OFFICE_MANAGER: 'Office Manager'
  }[roleKey] || roleKey || ''

  return `
    <table cellpadding="0" cellspacing="0" style="margin-top:8px;width:100%">
      <tr>
        <td class="sig-left" style="vertical-align:middle;padding-right:14px;width:96px;">
          <img src="${COMPANY_LOGO_URL}" alt="${escapeHtml(COMPANY_NAME)}" 
               style="width:88px;max-width:88px;height:auto;border-radius:6px;display:block;margin:0;" />
        </td>
        <td class="sig-center" style="vertical-align:middle;text-align:left;padding-left:6px;">
          <div style="font-weight:800;font-size:16px;color:#0b3b3b;margin-bottom:4px">${escapeHtml(name)}</div>
          ${prettyRole ? `<div style="color:#0fa3a3;font-size:13px;margin-bottom:8px;font-weight:600">${escapeHtml(prettyRole)}</div>` : ''}
          ${email ? `<div style="color:#6d8092;font-size:13px">Email: <a href="mailto:${escapeHtml(email)}" style="color:#0b3b3b;text-decoration:none">${escapeHtml(email)}</a></div>` : ''}
        </td>
        <td class="sig-right" style="vertical-align:middle;text-align:right;width:140px;padding-left:8px;">
          <div style="font-size:12px;color:#6d8092">${escapeHtml(COMPANY_NAME)}</div>
        </td>
      </tr>
    </table>
  `
}

function escapeHtml(str = '') {
  return String(str).replace(/[&<>\"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '\\"': '&quot;',
    "'": '&#39;'
  }[c]))
}
