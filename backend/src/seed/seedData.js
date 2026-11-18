import bcrypt from 'bcryptjs';

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
        }
      ],
      favorites: ['loc_001'],
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
    }
  ];

  const slots = [];

  // Generate Slots for Grand Central Plaza (48 slots: G:16, P1:16, P2:16)
  const loc1Floors = [
    { name: 'Ground Floor (G)', prefix: 'G', count: 16 },
    { name: 'Level 1 (P1)', prefix: 'P1', count: 16 },
    { name: 'Level 2 (P2)', prefix: 'P2', count: 16 }
  ];

  loc1Floors.forEach(f => {
    for (let i = 1; i <= f.count; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      const type = i <= 3 ? 'EV' : (i <= 5 ? 'VIP' : (i === 16 ? 'Accessible' : 'Standard'));
      slots.push({
        _id: `slot_loc001_${f.prefix}_${numStr}`,
        locationId: 'loc_001',
        slotNumber: `${f.prefix}-${numStr}`,
        floor: f.name,
        type: type,
        status: 'available',
        hourlyRate: type === 'EV' ? 55 : (type === 'VIP' ? 70 : 40),
        features: type === 'EV' ? ['50kW DC Fast Charger', 'Type-2 Plug'] : (type === 'VIP' ? ['Extra Wide Bay', 'Near Elevator'] : ['Standard Bay']),
        currentVehicle: null
      });
    }
  });

  // Generate Slots for CyberHub (36 slots: P1:18, P2:18)
  const loc2Floors = [
    { name: 'Level 1 (P1)', prefix: 'P1', count: 18 },
    { name: 'Level 2 (P2)', prefix: 'P2', count: 18 }
  ];

  loc2Floors.forEach(f => {
    for (let i = 1; i <= f.count; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      const type = i <= 4 ? 'EV' : (i <= 6 ? 'VIP' : 'Standard');
      slots.push({
        _id: `slot_loc002_${f.prefix}_${numStr}`,
        locationId: 'loc_002',
        slotNumber: `${f.prefix}-${numStr}`,
        floor: f.name,
        type: type,
        status: 'available',
        hourlyRate: type === 'EV' ? 65 : (type === 'VIP' ? 75 : 50),
        features: type === 'EV' ? ['60kW Rapid Charger'] : ['Sensor Protected'],
        currentVehicle: null
      });
    }
  });

  return {
    users,
    locations,
    slots,
    bookings: [],
    payments: [],
    entryLogs: []
  };
};
