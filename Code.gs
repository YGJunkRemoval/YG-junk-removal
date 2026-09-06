const CONFIG = {
  // Put the Gmail address where you want quote notifications here.
  NOTIFICATION_EMAIL: 'YOUR_GMAIL_ADDRESS_HERE',
  BUSINESS_NAME: 'Y&G Junk Removal',
  BUSINESS_PHONE: '(941) 888-0574'
};

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const firstName = clean_(data.firstName);
    const lastName = clean_(data.lastName);
    const phone = clean_(data.phone);
    const service = clean_(data.service);
    const details = clean_(data.details);
    const website = clean_(data.website); // honeypot

    if (website) return json_({ ok: true });
    if (!firstName || !lastName || !phone || !service) {
      return json_({ ok: false, error: 'Please complete all required fields.' }, 400);
    }

    const subject = `New quote request — ${firstName} ${lastName}`;
    const body = [
      `New quote request for ${CONFIG.BUSINESS_NAME}`,
      '',
      `Name: ${firstName} ${lastName}`,
      `Customer phone: ${phone}`,
      `Service: ${service}`,
      `Details: ${details || '(none provided)'}`,
      '',
      `Received: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`
    ].join('\n');

    MailApp.sendEmail(CONFIG.NOTIFICATION_EMAIL, subject, body);

    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'We could not send your request. Please call ' + CONFIG.BUSINESS_PHONE + '.' }, 500);
  }
}

function doGet() {
  return json_({ ok: true, service: 'Y&G quote endpoint' });
}

function clean_(value) {
  return String(value == null ? '' : value).trim().slice(0, 2000);
}

function json_(obj, status) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
