import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import BloodInventory from '../models/BloodInventory.js';
import BloodRequest from '../models/BloodRequest.js';
import BloodCamp from '../models/BloodCamp.js';
import AuditLog from '../models/AuditLog.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hemosync_db';
    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await BloodInventory.deleteMany();
    await BloodRequest.deleteMany();
    await BloodCamp.deleteMany();
    await AuditLog.deleteMany();

    console.log('[Seeder] Cleared old records');

    // 1. Create Users
    const adminUser = await User.create({
      name: 'Dr. Evelyn Reed (Chief Medical Officer)',
      email: 'admin@hemosync.org',
      password: 'password123',
      role: 'admin',
      bloodGroup: 'O-',
      phone: '+1-555-0199',
      address: {
        street: '100 Medical Center Blvd',
        city: 'Metro City',
        state: 'NY',
        pincode: '10001'
      }
    });

    const hospitalUser = await User.create({
      name: 'St. Jude General Hospital Requisition',
      email: 'hospital@stjude.org',
      password: 'password123',
      role: 'hospital',
      bloodGroup: 'Unknown',
      phone: '+1-555-0245',
      hospitalDetails: {
        hospitalName: 'St. Jude General Hospital',
        licenseNumber: 'HOSP-NY-98214',
        emergencyContact: '+1-555-9111'
      },
      address: {
        street: '450 Mercy Way',
        city: 'Metro City',
        state: 'NY',
        pincode: '10002'
      }
    });

    const donor1 = await User.create({
      name: 'Marcus Vance (Universal Donor)',
      email: 'marcus.vance@example.com',
      password: 'password123',
      role: 'donor',
      bloodGroup: 'O-',
      phone: '+1-555-0312',
      donorProfile: {
        dateOfBirth: new Date('1994-06-15'),
        gender: 'Male',
        weightKg: 78,
        hemoglobin: 15.2,
        totalDonations: 6,
        lastDonationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago (eligible)
        isAvailableToDonate: true
      },
      address: {
        street: '72 Pine St',
        city: 'Metro City',
        state: 'NY',
        pincode: '10003'
      }
    });

    const donor2 = await User.create({
      name: 'Elena Rostova',
      email: 'elena.rostova@example.com',
      password: 'password123',
      role: 'donor',
      bloodGroup: 'A+',
      phone: '+1-555-0455',
      donorProfile: {
        dateOfBirth: new Date('1998-11-20'),
        gender: 'Female',
        weightKg: 62,
        hemoglobin: 13.8,
        totalDonations: 3,
        lastDonationDate: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000),
        isAvailableToDonate: true
      },
      address: {
        street: '14 Elm Court',
        city: 'Metro City',
        state: 'NY',
        pincode: '10004'
      }
    });

    const recipientUser = await User.create({
      name: 'David Miller',
      email: 'david.miller@example.com',
      password: 'password123',
      role: 'recipient',
      bloodGroup: 'B+',
      phone: '+1-555-0789',
      address: {
        street: '88 Oak Ave',
        city: 'Metro City',
        state: 'NY',
        pincode: '10005'
      }
    });

    console.log('[Seeder] Users seeded');

    // 2. Create Blood Camps
    const camp1 = await BloodCamp.create({
      title: 'City University Autumn Blood Drive',
      organizer: 'Red Cross & Metro Youth League',
      venue: 'Campus Recreation Hall, Central University',
      address: {
        street: '500 University Ave',
        city: 'Metro City',
        state: 'NY',
        pincode: '10010'
      },
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // in 5 days
      startTime: '09:00 AM',
      endTime: '04:00 PM',
      targetUnits: 150,
      registeredDonorsCount: 42,
      collectedUnits: 0,
      status: 'Upcoming',
      contactPhone: '+1-555-CAMP1',
      description: 'Annual campus-wide blood drive to bolster regional inventory for emergency trauma centers.'
    });

    const camp2 = await BloodCamp.create({
      title: 'Tech Park Lifesaver Camp',
      organizer: 'Silicon Heights Health Forum',
      venue: 'Innovation Tower B Lobby',
      address: {
        street: '120 Tech Boulevard',
        city: 'Metro City',
        state: 'NY',
        pincode: '10015'
      },
      date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // in 12 days
      startTime: '10:00 AM',
      endTime: '05:00 PM',
      targetUnits: 200,
      registeredDonorsCount: 88,
      status: 'Upcoming',
      contactPhone: '+1-555-CAMP2',
      description: 'Corporate voluntary blood collection camp with on-site rapid health screening.'
    });

    console.log('[Seeder] Blood Camps seeded');

    // 3. Create Blood Inventory Units
    const bloodUnits = [
      // Available O-
      {
        bagBarcode: 'BAG-OM-001',
        bloodGroup: 'O-',
        component: 'Packed Red Blood Cells (PRBC)',
        volumeMl: 450,
        collectionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000),
        storageLocation: { refrigeratorUnit: 'Fridge-A1', shelfNumber: 'Rack-1', temperatureCelsius: 4.0 },
        testingStatus: 'passed',
        status: 'available',
        donor: donor1._id
      },
      {
        bagBarcode: 'BAG-OM-002',
        bloodGroup: 'O-',
        component: 'Packed Red Blood Cells (PRBC)',
        volumeMl: 450,
        collectionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        storageLocation: { refrigeratorUnit: 'Fridge-A1', shelfNumber: 'Rack-1', temperatureCelsius: 4.1 },
        testingStatus: 'passed',
        status: 'available',
        donor: donor1._id
      },
      // Available A+
      {
        bagBarcode: 'BAG-AP-001',
        bloodGroup: 'A+',
        component: 'Packed Red Blood Cells (PRBC)',
        volumeMl: 450,
        collectionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 39 * 24 * 60 * 60 * 1000),
        storageLocation: { refrigeratorUnit: 'Fridge-A2', shelfNumber: 'Rack-2', temperatureCelsius: 3.9 },
        testingStatus: 'passed',
        status: 'available',
        donor: donor2._id
      },
      {
        bagBarcode: 'BAG-AP-002',
        bloodGroup: 'A+',
        component: 'Platelets',
        volumeMl: 250,
        collectionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        storageLocation: { refrigeratorUnit: 'Agitator-P1', shelfNumber: 'Tray-1', temperatureCelsius: 22.0 },
        testingStatus: 'passed',
        status: 'available',
        donor: donor2._id
      },
      // Available B+
      {
        bagBarcode: 'BAG-BP-001',
        bloodGroup: 'B+',
        component: 'Whole Blood',
        volumeMl: 450,
        collectionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
        storageLocation: { refrigeratorUnit: 'Fridge-B1', shelfNumber: 'Rack-1', temperatureCelsius: 4.0 },
        testingStatus: 'passed',
        status: 'available'
      },
      // Available AB+
      {
        bagBarcode: 'BAG-ABP-001',
        bloodGroup: 'AB+',
        component: 'Fresh Frozen Plasma (FFP)',
        volumeMl: 300,
        collectionDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 345 * 24 * 60 * 60 * 1000),
        storageLocation: { refrigeratorUnit: 'DeepFreezer-F1', shelfNumber: 'Tray-3', temperatureCelsius: -25.0 },
        testingStatus: 'passed',
        status: 'available'
      },
      // Quarantine Unit (Newly collected)
      {
        bagBarcode: 'BAG-QUAR-099',
        bloodGroup: 'O+',
        component: 'Packed Red Blood Cells (PRBC)',
        volumeMl: 450,
        collectionDate: new Date(),
        expiryDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
        storageLocation: { refrigeratorUnit: 'Quarantine-Q1', shelfNumber: 'Rack-1', temperatureCelsius: 4.0 },
        testingStatus: 'pending',
        status: 'quarantine',
        notes: 'Awaiting ELISA/NAT viral screening'
      }
    ];

    await BloodInventory.insertMany(bloodUnits);
    console.log('[Seeder] Blood Inventory units seeded');

    // 4. Create Blood Requests
    await BloodRequest.create({
      requestId: 'REQ-EMERG-2026-01',
      requester: hospitalUser._id,
      patientName: 'Robert Martinez',
      patientAge: 46,
      patientGender: 'Male',
      hospitalName: 'St. Jude General Hospital - Trauma ICU',
      doctorName: 'Dr. Sarah Lin (Emergency Chief)',
      bloodGroup: 'O-',
      component: 'Packed Red Blood Cells (PRBC)',
      unitsRequired: 2,
      urgency: 'Critical/Emergency',
      clinicalDiagnosis: 'Multiple trauma from motor vehicle collision with active intra-abdominal hemorrhage',
      deliveryAddress: {
        street: '450 Mercy Way, Trauma Wing Bay 3',
        city: 'Metro City',
        pincode: '10002',
        contactPerson: 'Nurse Jenkins',
        contactPhone: '+1-555-9111'
      },
      status: 'Pending'
    });

    await BloodRequest.create({
      requestId: 'REQ-NORM-2026-02',
      requester: recipientUser._id,
      patientName: 'Sophia Miller',
      patientAge: 12,
      patientGender: 'Female',
      hospitalName: 'Metro Pediatric Clinic',
      doctorName: 'Dr. Gregory House',
      bloodGroup: 'B+',
      component: 'Packed Red Blood Cells (PRBC)',
      unitsRequired: 1,
      urgency: 'Normal',
      clinicalDiagnosis: 'Severe anemia secondary to Thalassemia Major scheduled transfusion',
      status: 'Pending'
    });

    console.log('[Seeder] Blood Requests seeded');

    console.log('\n=============================================');
    console.log('✅ HemoSync Demo Database Seeded Successfully!');
    console.log('Admin:       admin@hemosync.org / password123');
    console.log('Hospital:    hospital@stjude.org / password123');
    console.log('Donor:       marcus.vance@example.com / password123');
    console.log('Recipient:   david.miller@example.com / password123');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error]: ${error.message}`);
    process.exit(1);
  }
};

seedData();
