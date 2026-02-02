# SmartMoney - Deploy su Vercel

## 1. Vai su [vercel.com](https://vercel.com)

## 2. Clicca "Add New Project"

## 3. Importa il repository GitHub: `Sabbiola/SmartMoney`

## 4. Configura le Environment Variables:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://postgres:UaLhNQ7Xu73Cuqd8TnWRcbxiuFzsGkn7@db.lviaohvlspdewypujvjz.supabase.co:5432/postgres?sslmode=require` |
| `JWT_SECRET` | `smartmoney-super-secret-key-2024` |

## 5. Clicca "Deploy"

## 6. Dopo il deploy, esegui le migration del database

Vai su Vercel → Il tuo progetto → Settings → Functions → Console

Oppure dal terminale locale:
```bash
DATABASE_URL="postgresql://postgres:UaLhNQ7Xu73Cuqd8TnWRcbxiuFzsGkn7@db.lviaohvlspdewypujvjz.supabase.co:5432/postgres?sslmode=require" npx prisma db push
```

---

**URL della tua app dopo il deploy:** `https://smartmoney-xxx.vercel.app`
