import bcrypt from 'bcryptjs'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import pool from '../index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Run migrations first
const migration002 = readFileSync(join(__dirname, '../migrations/002_add_image_to_buildings.sql'), 'utf8')
await pool.query(migration002)
const migration003 = readFileSync(join(__dirname, '../migrations/003_add_image_to_units.sql'), 'utf8')
await pool.query(migration003)

// ─── Clear existing sample data (keep admin user) ────────────────────────────
await pool.query(`DELETE FROM invoices`)
await pool.query(`DELETE FROM contracts`)
await pool.query(`DELETE FROM faqs`)
await pool.query(`DELETE FROM users WHERE role = 'tenant'`)
await pool.query(`DELETE FROM units`)
await pool.query(`DELETE FROM buildings`)

// ─── Buildings ────────────────────────────────────────────────────────────────
const { rows: buildings } = await pool.query(`
  INSERT INTO buildings (name, address, description, image_url) VALUES
  (
    'Krokusstr. 14',
    'Krokusstraße 14, 80687 München',
    'Well-maintained residential building in Munich''s Westend district. Walking distance to U-Bahn Schwanthalerhöhe. Quiet neighbourhood with grocery stores, cafés and parks nearby.',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Regensburger Str. 22',
    'Regensburger Straße 22, 80634 München',
    'Solid Altbau building in the sought-after Neuhausen district. Stucco ceilings, high rooms, and excellent transport links — Tram 12 and U-Bahn Rotkreuzplatz within 5 minutes.',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
  )
  RETURNING id, name
`)

const [krokus, regensburger] = buildings
console.log(`Buildings created: ${krokus.name}, ${regensburger.name}`)

// ─── Units ────────────────────────────────────────────────────────────────────
const { rows: units } = await pool.query(`
  INSERT INTO units (building_id, unit_number, floor, rent_amount, is_available, description, image_url) VALUES
  -- Krokusstr. 14
  ($1, 'EG-Links',   0, 860.00,  false, '52 m² · 2 Zimmer · Keller · frisch renoviert',
   'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'),
  ($1, '1.OG-Links', 1, 950.00,  false, '58 m² · 2 Zimmer · Balkon · Parkett · Einbauküche',
   'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80'),
  ($1, '2.OG-Links', 2, 990.00,  false, '60 m² · 2 Zimmer · Südbalkon · Einbauküche · Parkett',
   'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'),
  ($1, 'DG-Links',   3, 1080.00, true,  '48 m² · 2 Zimmer · Dachterrasse · Panoramablick · Aufzug',
   'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=1200&q=80'),
  -- Regensburger Str. 22
  ($2, 'EG-Rechts',   0, 920.00,  false, '55 m² · 2 Zimmer · Gartenanteil · Stuckverzierung · Keller',
   'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80'),
  ($2, '1.OG-Rechts', 1, 1020.00, false, '64 m² · 3 Zimmer · Erker · Stuckdecken · Parkett',
   'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80'),
  ($2, '2.OG-Rechts', 2, 1060.00, false, '64 m² · 3 Zimmer · Loggia · Altbauflair · Hochparterre',
   'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?auto=format&fit=crop&w=1200&q=80'),
  ($2, 'DG-Rechts',   3, 1150.00, true,  '50 m² · 2 Zimmer · Dachterrasse · Bergblick · exklusiv',
   'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80')
  RETURNING id, unit_number, building_id, rent_amount
`, [krokus.id, regensburger.id])

const [kEG, k1, k2, kDG, rEG, r1, r2, rDG] = units
console.log(`Units created: ${units.length}`)

// ─── Tenants ──────────────────────────────────────────────────────────────────
const pw = await bcrypt.hash('tenant123', 10)

const tenants = [
  { name: 'Ahmed Karimi',       email: 'ahmed.karimi@gmail.com',       unit: kEG },
  { name: 'Maria Schneider',    email: 'maria.schneider@web.de',        unit: k1  },
  { name: 'Stefan Müller',      email: 'stefan.mueller@outlook.com',    unit: k2  },
  { name: 'Fatima Al-Hassan',   email: 'fatima.alhassan@gmail.com',     unit: rEG },
  { name: 'Thomas Weber',       email: 'thomas.weber@t-online.de',      unit: r1  },
  { name: 'Anna Kovacs',        email: 'anna.kovacs@gmx.de',            unit: r2  },
]

const createdTenants = []
for (const t of tenants) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, unit_id)
     VALUES ($1, $2, $3, 'tenant', $4) RETURNING id, name, email`,
    [t.name, t.email, pw, t.unit.id]
  )
  createdTenants.push({ ...rows[0], unit: t.unit })
}

// Mark occupied units
const occupiedIds = [kEG.id, k1.id, k2.id, rEG.id, r1.id, r2.id]
await pool.query(`UPDATE units SET is_available = false WHERE id = ANY($1)`, [occupiedIds])
console.log(`Tenants created: ${createdTenants.length}`)

// ─── Invoices ─────────────────────────────────────────────────────────────────
// August 2026 → paid | September 2026 → unpaid
const invoiceSets = [
  { month: 8, year: 2026, status: 'paid',   paid_at: '2026-08-02' },
  { month: 9, year: 2026, status: 'unpaid', paid_at: null         },
]

const nebenkosten = [
  { label: 'Betriebskosten',  amount: 85.00 },
  { label: 'Heizkosten',      amount: 45.00 },
]

for (const t of createdTenants) {
  for (const inv of invoiceSets) {
    const extras = JSON.stringify(nebenkosten)
    const total = parseFloat(t.unit.rent_amount) + nebenkosten.reduce((s, x) => s + x.amount, 0)
    await pool.query(
      `INSERT INTO invoices (tenant_id, month, year, rent_amount, extras, total, status, paid_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [t.id, inv.month, inv.year, t.unit.rent_amount, extras, total, inv.status, inv.paid_at]
    )
  }
}
console.log(`Invoices created: ${createdTenants.length * invoiceSets.length}`)

// ─── FAQs ─────────────────────────────────────────────────────────────────────
await pool.query(`
  INSERT INTO faqs (question_en, answer_en, question_de, answer_de) VALUES
  (
    'When is the rent due each month?',
    'Rent is due on the 1st of each month. Please transfer the full amount — including Nebenkosten — to the bank account stated in your rental contract. Late payments may incur a reminder fee.',
    'Wann ist die monatliche Miete fällig?',
    'Die Miete ist jeweils am 1. eines Monats fällig. Bitte überweisen Sie den Gesamtbetrag inklusive Nebenkosten auf das in Ihrem Mietvertrag angegebene Konto. Bei verspäteter Zahlung kann eine Mahngebühr anfallen.'
  ),
  (
    'What is included in the Nebenkosten?',
    'The monthly Nebenkosten (utility charges) cover building operating costs, heating, water, waste disposal, staircase cleaning, and building insurance. Electricity and internet are billed separately and are the tenant''s responsibility.',
    'Was ist in den Nebenkosten enthalten?',
    'Die monatlichen Nebenkosten umfassen Betriebskosten des Gebäudes, Heizung, Wasser, Müllentsorgung, Treppenhausreinigung und Gebäudeversicherung. Strom und Internet werden separat abgerechnet und liegen in der Verantwortung des Mieters.'
  ),
  (
    'How do I access my monthly invoices?',
    'All your monthly Rechnungen are available in your personal tenant dashboard under "My Invoices". You can view your payment status and download each invoice as a PDF at any time.',
    'Wie kann ich auf meine monatlichen Rechnungen zugreifen?',
    'Alle monatlichen Rechnungen stehen in Ihrem persönlichen Mieter-Dashboard unter „Meine Rechnungen" zur Verfügung. Sie können Ihren Zahlungsstatus einsehen und jede Rechnung jederzeit als PDF herunterladen.'
  ),
  (
    'How do I report a maintenance or repair issue?',
    'Please contact us by email at wartung@naweed.com with a brief description of the issue and your unit number. For urgent issues such as water damage or heating failure, call us directly. We aim to respond within 24 hours on business days.',
    'Wie melde ich ein Wartungs- oder Reparaturproblem?',
    'Bitte schreiben Sie uns eine E-Mail an wartung@naweed.com mit einer kurzen Beschreibung des Problems und Ihrer Wohnungsnummer. Bei dringenden Problemen wie Wasserschäden oder Heizungsausfall rufen Sie uns bitte direkt an. Wir antworten innerhalb von 24 Stunden an Werktagen.'
  ),
  (
    'Can I get a copy of my rental contract?',
    'Your rental contract is available for download at any time from your tenant dashboard under "My Contract". If you have not received it yet, please contact your property manager — it will be uploaded as soon as the signed copy is processed.',
    'Kann ich eine Kopie meines Mietvertrags erhalten?',
    'Ihr Mietvertrag steht in Ihrem Mieter-Dashboard unter „Mein Vertrag" jederzeit zum Download bereit. Falls Sie ihn noch nicht erhalten haben, wenden Sie sich bitte an Ihren Hausverwalter — er wird hochgeladen, sobald die unterzeichnete Kopie vorliegt.'
  )
`)
console.log(`FAQs created: 5`)
console.log(`\n✅ Sample data seeded successfully.`)
console.log(`\nTenant login (all): password = tenant123`)
createdTenants.forEach(t => console.log(`  ${t.email}`))

await pool.end()
