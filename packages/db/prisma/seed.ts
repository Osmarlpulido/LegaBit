import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.BOOTSTRAP_SUPER_ADMIN_EMAIL;

  if (!email) {
    console.log("BOOTSTRAP_SUPER_ADMIN_EMAIL no definido. Seed sin cambios.");
    return;
  }

  const user = await prisma.user.findFirst({ where: { email } });

  if (!user) {
    console.log(`No se encontró un usuario con email "${email}".`);
    console.log("Inicia sesión primero con Google OAuth para que se cree el registro en Prisma, luego vuelve a ejecutar el seed.");
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { platformRole: "super_admin" }
  });

  console.log(`✓ ${email} ahora tiene platformRole = super_admin`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
