/**
 * Script de bootstrap: crea el usuario administrador inicial.
 * Lee ADMIN_BOOTSTRAP_EMAIL y ADMIN_BOOTSTRAP_PASSWORD del .env.
 * Uso: npx tsx scripts/bootstrap-admin.ts
 */
import { hash } from 'bcryptjs';
import { sql } from 'drizzle-orm';
import { getDb, schema } from '../src/lib/db';

const EMAIL = process.env.ADMIN_BOOTSTRAP_EMAIL ?? '';
const PASSWORD = process.env.ADMIN_BOOTSTRAP_PASSWORD ?? '';

if (!EMAIL || !PASSWORD) {
  console.error('Faltan ADMIN_BOOTSTRAP_EMAIL o ADMIN_BOOTSTRAP_PASSWORD en .env');
  process.exit(1);
}

async function main() {
  const db = getDb();
  if (!db) {
    console.error('DATABASE_URL no configurada');
    process.exit(1);
  }

  const existing = await db.execute(sql`
    SELECT id, email FROM admin_users WHERE email = ${EMAIL.toLowerCase()} LIMIT 1
  `);
  if (existing.rows.length > 0) {
    console.log(`El admin ya existe: ${existing.rows[0].email} (id=${existing.rows[0].id})`);
    return;
  }

  const passwordHash = await hash(PASSWORD, 12);
  const result = await db.execute(sql`
    INSERT INTO admin_users (email, password_hash, role, is_active, created_at)
    VALUES (${EMAIL.toLowerCase()}, ${passwordHash}, 'OWNER', true, now())
    RETURNING id, email, role, is_active
  `);

  const user = result.rows[0] as { id: number; email: string; role: string; is_active: boolean };
  console.log('Admin creado correctamente:');
  console.log(`  ID:     ${user.id}`);
  console.log(`  Email:  ${user.email}`);
  console.log(`  Rol:    ${user.role}`);
  console.log(`  Activo: ${user.is_active}`);
  console.log('\nPuedes iniciar sesión en /admin/login/');
}

main().catch((err) => {
  console.error('Error creando admin:', err);
  process.exit(1);
});
