import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DUMMY_EMPLOYEES: Prisma.EmployeeCreateManyInput[] = [
  {
    employeeId: "EMP001",
    name: "Amit Sharma",
    department: "marketing",
    designation: "Marketing Executive",
    contactNumber: "9876543210",
  },
  {
    employeeId: "EMP002",
    name: "Priya Desai",
    department: "technology",
    designation: "UI Designer",
    contactNumber: "9123456780",
  },
  {
    employeeId: "EMP003",
    name: "Rahul Verma",
    department: "finance",
    designation: "Account Manager",
    contactNumber: "9988776655",
  },
];

async function seedEmployees() {
  try {
    console.log("Seeding dummy employees...");

    await prisma.employee.deleteMany();

    const employees = await prisma.employee.createMany({
      data: DUMMY_EMPLOYEES,
    });

    console.log(`✅ Successfully seeded ${employees.count} employees`);
  } catch (error) {
    console.error("❌ Error seeding employees:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedEmployees();
