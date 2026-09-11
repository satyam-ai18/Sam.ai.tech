const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const existing = await p.admission.findUnique({
    where: { referenceNumber: 'MK-2026-1042' }
  });

  if (!existing) {
    const adm1 = await p.admission.create({
      data: {
        referenceNumber: 'MK-2026-1042',
        status: 'UNDER_REVIEW',
        adminMessage: 'Document verification scheduled for 15th Sep at Principal Office.',
        studentFirstName: 'Aarav',
        studentLastName: 'Sharma',
        studentGender: 'MALE',
        studentDob: new Date('2015-05-12'),
        classApplied: 'Class 5',
        session: '2025-26',
        phone: '9876543210',
        email: 'parent.sharma@example.com',
        address: 'Plot 42, Civil Lines',
        city: 'Haridwar',
        state: 'Uttarakhand',
        pincode: '249401',
        fatherName: 'Rajesh Sharma',
        fatherOccupation: 'Engineer',
        motherName: 'Sunita Sharma',
        motherOccupation: 'Teacher',
        statusHistory: {
          create: [
            { fromStatus: null, toStatus: 'SUBMITTED', notes: 'Application submitted online' },
            { fromStatus: 'SUBMITTED', toStatus: 'UNDER_REVIEW', notes: 'Documents under review by Admissions Office' }
          ]
        }
      }
    });
    console.log('Created admission:', adm1.referenceNumber);
  }

  const existing2 = await p.admission.findUnique({
    where: { referenceNumber: 'MK-2026-1043' }
  });

  if (!existing2) {
    const adm2 = await p.admission.create({
      data: {
        referenceNumber: 'MK-2026-1043',
        status: 'APPROVED',
        adminMessage: 'Congratulations! Admission granted. Please pay admission fee by 20th Sep.',
        studentFirstName: 'Priya',
        studentLastName: 'Patel',
        studentGender: 'FEMALE',
        studentDob: new Date('2019-08-20'),
        classApplied: 'Class 1',
        session: '2025-26',
        phone: '9812345678',
        email: 'patel.family@example.com',
        address: '14, Ganga Vihar',
        city: 'Haridwar',
        state: 'Uttarakhand',
        pincode: '249407',
        fatherName: 'Amit Patel',
        motherName: 'Meera Patel',
        statusHistory: {
          create: [
            { fromStatus: null, toStatus: 'SUBMITTED', notes: 'Application submitted online' },
            { fromStatus: 'SUBMITTED', toStatus: 'UNDER_REVIEW', notes: 'Verification in progress' },
            { fromStatus: 'UNDER_REVIEW', toStatus: 'VERIFIED', notes: 'Documents verified successfully' },
            { fromStatus: 'VERIFIED', toStatus: 'APPROVED', notes: 'Admission offered' }
          ]
        }
      }
    });
    console.log('Created admission:', adm2.referenceNumber);
  }
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
