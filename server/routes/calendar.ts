const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/sync/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user exists
    const userRes = await db.query('SELECT name, email FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).send('User not found');
    }

    const userName = userRes.rows[0].name || 'Danışman';

    // Fetch leads for this user that have calendar events
    const leadsRes = await db.query(`
      SELECT id, name, properties 
      FROM leads 
      WHERE assigned_to = $1 AND properties->'calendar_event' IS NOT NULL
    `, [userId]);

    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Kapora Emlak Asistanı//TR
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Kapora - ${userName}
X-WR-TIMEZONE:Europe/Istanbul
X-WR-CALDESC:Kapora akıllı asistanınız tarafından oluşturulan hatırlatıcılar ve görevler
`;

    leadsRes.rows.forEach(lead => {
      let props = lead.properties;
      if (typeof props === 'string') {
        try { props = JSON.parse(props); } catch(e) {}
      }
      
      const ev = props.calendar_event;
      if (ev && ev.is_task && ev.start_date) {
        // Date formats: YYYYMMDDTHHMMSSZ
        const cleanDate = ev.start_date.replace(/-/g, '');
        let cleanTime = ev.start_time ? ev.start_time.replace(/:/g, '') : '090000';
        if (cleanTime.length === 4) cleanTime = cleanTime + '00';
        
        // Let's assume events are 1 hour long if no end time is provided
        const startDateTime = `${cleanDate}T${cleanTime}`;
        
        let endDateTime = startDateTime;
        if (ev.end_time) {
          let cleanEndTime = ev.end_time.replace(/:/g, '');
          if (cleanEndTime.length === 4) cleanEndTime = cleanEndTime + '00';
          endDateTime = `${cleanDate}T${cleanEndTime}`;
        } else {
          // Add 1 hour simple logic (not robust for month-end, but this is a simple mock)
          // Actually, if we don't know end time, just don't set it or just pass 1 hour ahead
          // For simplicity, we just use the same day and +1 hour (basic string manipulation)
          let h = parseInt(cleanTime.substring(0,2)) + 1;
          let newH = h < 10 ? '0'+h : (h > 23 ? '23' : h.toString());
          endDateTime = `${cleanDate}T${newH}${cleanTime.substring(2)}`;
        }

        const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        const description = ev.description ? ev.description.replace(/\n/g, '\\n') : '';

        icsContent += `BEGIN:VEVENT
UID:${lead.id}@kapora.online
DTSTAMP:${now}
DTSTART;TZID=Europe/Istanbul:${startDateTime}
DTEND;TZID=Europe/Istanbul:${endDateTime}
SUMMARY:${ev.title || 'Görev'} - Müşteri: ${lead.name}
DESCRIPTION:${description}
END:VEVENT
`;
      }
    });

    icsContent += `END:VCALENDAR`;

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="kapora_ajanda_${userId}.ics"`);
    res.send(icsContent);

  } catch (err) {
    console.error('ICS export error:', err);
    res.status(500).send('Error generating calendar sync');
  }
});

module.exports = router;
