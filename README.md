# Emlak Asistanı

Bu proje, emlak danışmanları için geliştirilmiş, WhatsApp mesajlarını yapay zeka ile analiz eden ve potansiyel müşterileri (lead'leri) önceliklendiren bir CRM sistemidir.

## Kurulum ve Çalıştırma

1. Veritabanını oluşturun:
   \`\`\`bash
   psql -d postgres -c "CREATE DATABASE emlak_asistani;"
   psql -d emlak_asistani -f server/db/schema.sql
   \`\`\`

2. Backend'i çalıştırın:
   \`\`\`bash
   cd server
   npm install
   # .env dosyasındaki GEMINI_API_KEY değerini güncelleyin
   npm run dev
   \`\`\`

3. Frontend'i çalıştırın:
   \`\`\`bash
   cd client
   npm install
   npm run dev
   \`\`\`

## Dağıtım (Deployment)

### Frontend (Firebase Hosting)
1. Firebase CLI'ı yükleyin: `npm install -g firebase-tools`
2. Firebase'e giriş yapın: `firebase login`
3. Projeyi başlatın:
   \`\`\`bash
   cd client
   firebase init hosting
   # Public directory: dist
   # Configure as a single-page app: Yes
   \`\`\`
4. Projeyi derleyin ve yayınlayın:
   \`\`\`bash
   npm run build
   firebase deploy
   \`\`\`

### Backend (Google Cloud Run)
1. Google Cloud SDK kurun.
2. Server dizininde bir `Dockerfile` oluşturun.
3. Projeyi deploy edin:
   \`\`\`bash
   cd server
   gcloud run deploy emlak-asistani-api --source . --platform managed
   \`\`\`
