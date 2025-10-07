import { COMPANY_NAME, FRONTEND_URL } from '../../config/env.js'

// export default function managerToUserTemplate ({ sender, recipient, message }) {
//   const body = formatMessage(message)
//   return `
//     <div style="font-size:15px;line-height:1.6;color:inherit;">
//       <p style="margin:0 0 12px;">Hello ${escapeHtml(recipient.fullName)},</p>

//       <div style="background:linear-gradient(180deg, rgba(78,161,255,0.06), rgba(0,0,0,0)); padding:12px; border-radius:8px; margin-bottom:14px;">
//         <strong style="display:block;font-size:15px;margin-bottom:6px;color:#133b66;">Message from ${escapeHtml(sender.fullName)} (${escapeHtml(prettyRole(sender.role))})</strong>
//         <div style="font-size:14px;color:#12324a">${body}</div>
//       </div>

//       <p style="margin:0 0 8px;">If you have any questions or need help, please reply to this email or visit our portal.</p>

//       <p style="margin-top:18px;margin-bottom:6px;">Best regards,</p>
//       ${roleSignature({ sender })}

//       <div style="margin-top:18px;font-size:13px;color:#6d8092">
//         <a href="${FRONTEND_URL}" style="color:#3366cc;text-decoration:none;">Visit ${escapeHtml(COMPANY_NAME)} portal</a>
//       </div>
//     </div>
//   `
// }

// function formatMessage (msg = '') {
//   const cleaned = String(msg || '').trim().replace(/\r\n/g, '\n')
//   const paragraphs = cleaned.split(/\n{2,}/).map(p =>
//     `<p style="margin:0 0 12px;">${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`
//   )
//   return paragraphs.join('')
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

// function prettyRole (role) {
//   const map = { IT_MANAGER: 'IT Manager', CEO: 'CEO', EMPLOYEE: 'Staff' }
//   return map[role] || role
// }


export default function managerToUserTemplate({ sender, recipient, message }) {
  const body = formatMessage(message)

  return `
    <div style="font-size:15px;line-height:1.6;color:inherit;">
      <p style="margin:0 0 12px;">Hello ${escapeHtml(recipient.fullName)},</p>

      <div style="background:linear-gradient(180deg, rgba(78,161,255,0.06), rgba(0,0,0,0)); 
                  padding:12px; border-radius:8px; margin-bottom:14px;">
        <strong style="display:block;font-size:15px;margin-bottom:6px;color:#133b66;">
          Message from ${escapeHtml(prettyRole(sender.role))}
        </strong>
        <div style="font-size:14px;color:#12324a">${body}</div>
      </div>

      <p style="margin:0 0 8px;">If you have any questions or need help, please reply to this email or visit our portal.</p>

      <p style="margin-top:18px;margin-bottom:6px;">Best regards,</p>

      <!-- Signature is rendered by the base template to avoid duplication -->

      <div style="margin-top:18px;font-size:13px;color:#6d8092">
        <a href="${FRONTEND_URL}" style="color:#3366cc;text-decoration:none;">Visit ${escapeHtml(COMPANY_NAME)} portal</a>
      </div>

    </div>
  `
}

function formatMessage(msg = '') {
  const cleaned = String(msg || '').trim().replace(/\r\n/g, '\n')
  const paragraphs = cleaned.split(/\n{2,}/).map(p =>
    `<p style="margin:0 0 12px;">${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`
  )
  return paragraphs.join('')
}

function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]))
}

function prettyRole(role) {
  const map = { IT_MANAGER: 'IT Manager', CEO: 'CEO', OFFICE_MANAGER: 'Office Manager' }
  return map[role] || role
}
