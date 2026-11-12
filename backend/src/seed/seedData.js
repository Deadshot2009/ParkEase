import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const getInitialData = () => {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);
  const userPasswordHash = bcrypt.hashSync('user123', salt);

  const adminId = 'usr_admin_001';
  const userId = 'usr_demo_002';

  const users = [
    {
      _id: adminId,
      name: 'ParkEase Administrator',
      email: 'admin@parkease.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      vehicles: [
        {
          id: 'veh_01',
          plateNumber: 'KA-01-AB-1234',
          makeModel: 'Tesla Model 3',
          type: 'EV',
          color: 'Pearl White'
        }
      ],
      favorites: ['loc_001', 'loc_002'],
      createdAt: new Date().toISOString()
    },
    {
      _id: userId,
      name: 'Alex Mercer',
      email: 'user@parkease.com',
      passwordHash: userPasswordHash,
      role: 'user',
      phone: '+91 91234 56789',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      vehicles: [
        {
          id: 'veh_02',
          plateNumber: 'MH-02-CP-8899',
          makeModel: 'BMW 3 Series M-Sport',
          type: 'Car',
          color: 'Tanzanite Blue'
        },
        {
          id: 'veh_03',
          plateNumber: 'KA-05-EV-4411',
          makeModel: 'Tata Nexon EV Max',
          type: 'EV',
          color: 'Teal Blue'
        }
      ],
      favorites: ['loc_001', 'loc_003'],
      createdAt: new Date().toISOString()
    }
  ];

  const locations = [
    {
      _id: 'loc_001',
      name: 'Grand Central Horizon Plaza',
      tagline: 'Multi-Level Smart Hub • Covered & EV Equipped',
      address: '77 Downtown Avenue, Financial District, Tech Metropolis',
      coordinates: { lat: 28.6139, lng: 77.2090 },
      distance: '1.2 km away',
      pricing: { hourlyRate: 40, dayPassRate: 350 },
      totalSlots: 48,
      rating: 4.9,
      reviewCount: 342,
      operatingHours: '24/7 Mon-Sun',
      images: [
        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80'
      ],
      amenities: ['24/7 Security CCTV', 'Fast EV Charging', 'Automated Boom Barrier', 'Car Wash Bay', 'Valet Assist', 'Covered Roof'],
      floors: ['Ground Floor (G)', 'Level 1 (P1)', 'Level 2 (P2)']
    },
    {
      _id: 'loc_002',
      name: 'CyberHub Smart Tech Deck',
      tagline: 'Next-Gen Automated Parking with Sensor Guidance',
      address: 'Plot 14-A, Silicon Valley Corridor, Sector 5',
      coordinates: { lat: 28.5355, lng: 77.3910 },
      distance: '2.8 km away',
      pricing: { hourlyRate: 50, dayPassRate: 420 },
      totalSlots: 36,
      rating: 4.8,
      reviewCount: 219,
      operatingHours: '06:00 AM - 01:00 AM',
      images: [
        'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
      ],
      amenities: ['Rapid CCS2 EV Chargers', 'Digital Numberplate Scanner', 'Restroom Facility', 'Security Guards'],
      floors: ['Level 1 (P1)', 'Level 2 (P2)']
    },
    {
      _id: 'loc_003',
      name: 'Skyline Terminal & Airport Express Deck',
      tagline: 'Long-Stay & Priority Valet with Terminal Shuttles',
      address: 'Airport Bypass Expressway, Terminal 3 Gate 4',
      coordinates: { lat: 28.5562, lng: 77.1000 },
      distance: '5.4 km away',
      pricing: { hourlyRate: 60, dayPassRate: 500 },
      totalSlots: 40,
      rating: 4.95,
      reviewCount: 512,
      operatingHours: '24/7 Always Open',
      images: [
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80'
      ],
      amenities: ['Free Airport Shuttle', 'Luggage Assistance', 'Underground Climate Control', 'High-Res CCTV', 'Fast EV Superchargers'],
      floors: ['Terminal Wing A', 'Terminal Wing B']
    },
    {
      _id: 'loc_004',
      name: 'Palms Galleria & Lifestyle Mall',
      tagline: 'Premium Shopping Mall Parking with Family & Accessible Bays',
      address: '808 Promenade Mall Road, Westside Galleria',
      coordinates: { lat: 28.4595, lng: 77.0266 },
      distance: '3.6 km away',
      pricing: { hourlyRate: 35, dayPassRate: 300 },
      totalSlots: 32,
      rating: 4.7,
      reviewCount: 180,
      operatingHours: '09:00 AM - 12:00 AM',
      images: [
        'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80'
      ],
      amenities: ['Direct Mall Elevator Entry', 'Accessible Parking', 'Family Parking', 'Pre-booking Discounts'],
      floors: ['Basement 1 (B1)', 'Basement 2 (B2)']
    }
  ];

  // Generate realistic slots for loc_001
  const slots = [];
  const floors = [
    { name: 'Ground Floor (G)', prefix: 'G', count: 16 },
    { name: 'Level 1 (P1)', prefix: 'P1', count: 16 },
    { name: 'Level 2 (P2)', prefix: 'P2', count: 16 },
  ];

  floors.forEach(f => {
    for (let i = 1; i <= f.count; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      let type = 'Standard';
      let priceMult = 1.0;
      if (i <= 3) {
        type = 'EV';
        priceMult = 1.25;
      } else if (i === 4 || i === 5) {
        type = 'VIP';
        priceMult = 1.5;
      } else if (i === 6) {
        type = 'Accessible';
        priceMult = 1.0;
      }

      // Initial status: some occupied, some reserved, most available
      let status = 'available';
      if (f.prefix === 'G' && (i === 2 || i === 7 || i === 12)) status = 'booked';
      if (f.prefix === 'G' && i === 4) status = 'reserved';
      if (f.prefix === 'P1' && (i === 3 || i === 8)) status = 'booked';
      if (f.prefix === 'P2' && i === 15) status = 'unavailable';

      slots.push({
        _id: `slot_loc001_${f.prefix}_${numStr}`,
        locationId: 'loc_001',
        slotNumber: `${f.prefix}-${numStr}`,
        floor: f.name,
        type: type, // Standard, EV, VIP, Accessible
        status: status, // available, booked, reserved, unavailable
        hourlyRate: Math.round(40 * priceMult),
        features: type === 'EV' ? ['50kW DC Fast Charging', 'Universal Type 2 Plug'] : (type === 'VIP' ? ['Extra Wide Bay', 'Direct Elevator Access'] : ['Wide Angle Camera Coverage']),
        currentVehicle: status === 'booked' ? 'DL-01-XX-9900' : null
      });
    }
  });

  // Slots for loc_002
  ['Level 1 (P1)', 'Level 2 (P2)'].forEach((floorName, idx) => {
    const pfx = idx === 0 ? 'P1' : 'P2';
    for (let i = 1; i <= 18; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      const type = i <= 4 ? 'EV' : (i <= 6 ? 'VIP' : 'Standard');
      const status = (i === 2 || i === 9) ? 'booked' : (i === 5 ? 'reserved' : 'available');
      slots.push({
        _id: `slot_loc002_${pfx}_${numStr}`,
        locationId: 'loc_002',
        slotNumber: `${pfx}-${numStr}`,
        floor: floorName,
        type: type,
        status: status,
        hourlyRate: type === 'EV' ? 65 : (type === 'VIP' ? 75 : 50),
        features: type === 'EV' ? ['60kW Rapid Charger'] : ['Sensor Protected'],
        currentVehicle: status === 'booked' ? 'KA-03-ZZ-3344' : null
      });
    }
  });

  // Sample confirmed booking for demo user
  const now = new Date();
  const startTime = new Date(now.getTime() - 45 * 60000).toISOString();
  const endTime = new Date(now.getTime() + 135 * 60000).toISOString(); // 3 hours duration

  const sampleBooking = {
    _id: 'bk_demo_1001',
    bookingReference: 'PE-2026-90412',
    userId: userId,
    userName: 'Alex Mercer',
    userEmail: 'user@parkease.com',
    userPhone: '+91 91234 56789',
    locationId: 'loc_001',
    locationName: 'Grand Central Horizon Plaza',
    locationAddress: '77 Downtown Avenue, Financial District, Tech Metropolis',
    slotId: 'slot_loc001_G_02',
    slotNumber: 'G-02',
    floor: 'Ground Floor (G)',
    slotType: 'EV',
    vehicle: {
      plateNumber: 'MH-02-CP-8899',
      makeModel: 'BMW 3 Series M-Sport',
      type: 'Car'
    },
    startTime: startTime,
    endTime: endTime,
    durationHours: 3,
    ratePerHour: 50,
    subtotal: 150,
    taxes: 27,
    totalAmount: 177,
    paymentStatus: 'PAID',
    paymentMethod: 'UPI / Google Pay',
    paymentReference: 'UPI-RAZORPAY-882941042',
    bookingStatus: 'ACTIVE', // ACTIVE, COMPLETED, CANCELLED, PENDING
    qrCodeData: JSON.stringify({
      bookingRef: 'PE-2026-90412',
      slot: 'G-02',
      locationId: 'loc_001',
      plateNumber: 'MH-02-CP-8899',
      validUntil: endTime,
      token: 'SECURE_GATE_TOKEN_9921_OK'
    }),
    entryTime: new Date(now.getTime() - 30 * 60000).toISOString(),
    exitTime: null,
    createdAt: new Date(now.getTime() - 60 * 60000).toISOString()
  };

  const sampleCompletedBooking = {
    _id: 'bk_demo_1000',
    bookingReference: 'PE-2026-87140',
    userId: userId,
    userName: 'Alex Mercer',
    userEmail: 'user@parkease.com',
    userPhone: '+91 91234 56789',
    locationId: 'loc_001',
    locationName: 'Grand Central Horizon Plaza',
    locationAddress: '77 Downtown Avenue, Financial District, Tech Metropolis',
    slotId: 'slot_loc001_G_07',
    slotNumber: 'G-07',
    floor: 'Ground Floor (G)',
    slotType: 'Standard',
    vehicle: {
      plateNumber: 'MH-02-CP-8899',
      makeModel: 'BMW 3 Series M-Sport',
      type: 'Car'
    },
    startTime: new Date(now.getTime() - 86400000 * 2).toISOString(),
    endTime: new Date(now.getTime() - 86400000 * 2 + 7200000).toISOString(),
    durationHours: 2,
    ratePerHour: 40,
    subtotal: 80,
    taxes: 14.4,
    totalAmount: 94.4,
    paymentStatus: 'PAID',
    paymentMethod: 'UPI / PhonePe',
    paymentReference: 'UPI-RAZORPAY-771920311',
    bookingStatus: 'COMPLETED',
    qrCodeData: JSON.stringify({
      bookingRef: 'PE-2026-87140',
      slot: 'G-07',
      locationId: 'loc_001'
    }),
    entryTime: new Date(now.getTime() - 86400000 * 2 + 5 * 60000).toISOString(),
    exitTime: new Date(now.getTime() - 86400000 * 2 + 7150000).toISOString(),
    createdAt: new Date(now.getTime() - 86400000 * 2 - 1800000).toISOString()
  };

  const bookings = [sampleBooking, sampleCompletedBooking];

  const payments = [
    {
      _id: 'pay_001',
      bookingId: 'bk_demo_1001',
      bookingReference: 'PE-2026-90412',
      userId: userId,
      userName: 'Alex Mercer',
      amount: 177,
      currency: 'INR',
      method: 'UPI (Google Pay)',
      upiId: 'alexmercer@okaxis',
      status: 'SUCCESS',
      transactionId: 'TXN_UPI_983712984',
      createdAt: sampleBooking.createdAt
    },
    {
      _id: 'pay_002',
      bookingId: 'bk_demo_1000',
      bookingReference: 'PE-2026-87140',
      userId: userId,
      userName: 'Alex Mercer',
      amount: 94.4,
      currency: 'INR',
      method: 'UPI (PhonePe)',
      upiId: 'alexmercer@ybl',
      status: 'SUCCESS',
      transactionId: 'TXN_UPI_652199843',
      createdAt: sampleCompletedBooking.createdAt
    }
  ];

  const entryLogs = [
    {
      _id: 'log_001',
      bookingId: 'bk_demo_1001',
      bookingReference: 'PE-2026-90412',
      slotNumber: 'G-02',
      plateNumber: 'MH-02-CP-8899',
      action: 'ENTRY',
      scannedAt: sampleBooking.entryTime,
      verifiedBy: 'Gate Scanner #01-A',
      status: 'VERIFIED'
    }
  ];

  return {
    users,
    locations,
    slots,
    bookings,
    payments,
    entryLogs
  };
};
