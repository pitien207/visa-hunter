/**
 * All tunable numbers live here (plan §9: "all balancing numbers in data/config.ts").
 * Engine code reads from CONFIG; never hardcode gameplay/feel values in components.
 */

export type Vec3 = [number, number, number]

export const CONFIG = {
  version: '1.0.0',

  player: {
    /** Metres per second at full joystick / key press. */
    walkSpeed: 4.2,
    /** How quickly velocity reaches the target (higher = snappier). */
    accelSharpness: 12,
    /** How quickly the character turns to face the move direction. */
    turnSharpness: 14,
    /** Spawn point: on the sidewalk in front of the family house. */
    spawn: [-5.5, 0.2, -2.6] as Vec3,
    /** Respawn if the player somehow falls below this height. */
    fallResetY: -5,
    /** Speed multiplier when the game walks the player somewhere (e.g. behind a counter). */
    autoWalkSpeedScale: 0.8,
    /** If an auto-walk gets stuck this long, the player is placed at the destination. */
    autoWalkTimeoutSec: 6,
  },

  camera: {
    fov: 45,
    /** Wider vertical FOV on tall portrait screens so you still see the street. */
    portraitFov: 62,
    /** Distance from the look target in landscape. */
    distance: 9,
    /** Downward angle of the camera (plan §2: ~35–45°). */
    pitchDeg: 40,
    /** Extra distance multiplier for tall portrait screens. */
    portraitDistanceScale: 1.3,
    followSharpness: 7,
    /** Height above the player's feet that the camera looks at. */
    lookHeight: 0.9,
    /** Radians of yaw per pixel dragged. */
    dragSensitivity: 0.006,
    initialYaw: 0,
    /** Closest the camera may be pulled in when a building blocks the view. */
    minDistance: 2.5,
    /** Distance multiplier while working at a station (plan §2: slight zoom on interaction). */
    workZoom: 0.72,
  },

  /** Money/energy change through jobs (M2); time, energy restore and saving arrive in M3. */
  startingStats: {
    money: 2_500_000, // VND
    energy: 80,
    maxEnergy: 100,
    mood: 60,
  },

  /** In-game clock (plan §5.2). The day starts at 07:00 on Monday, day 1. */
  time: {
    /** Game minutes that pass per real second while walking around. */
    minutesPerSecond: 1,
    startMinutes: 7 * 60,
    wakeHour: 7,
    /** Still awake at this hour → you fall asleep on the street. */
    passOutHour: 2,
    /** Sleeping is allowed from this hour, or any time when energy is low. */
    sleepFromHour: 18,
    sleepIfEnergyBelow: 35,
    /** Minutes a chat with an NPC takes. */
    talkMinutes: 5,
  },

  /** Energy and mood over time. */
  needs: {
    energyDrainPerHour: 2,
    /** Mood slowly returns toward this value (points per game hour). */
    moodBaseline: 55,
    moodDriftPerHour: 1,
    sleepMood: 10,
    passOutEnergy: 40,
    passOutMood: -15,
    /** Mood change per shift = (satisfaction − 50) × this × share of shift worked. */
    workMoodFactor: 0.12,
  },

  npc: {
    walkSpeed: 1.25,
    vendorSpeed: 0.75,
    /** NPCs stop when the player is this close in front of them. */
    yieldDistance: 1.1,
    /** Seconds between trà đá chats [min, max]. */
    chatIntervalSec: [8, 15] as [number, number],
    /** Seconds between one-liners from a single NPC [min, max]. */
    soloIntervalSec: [12, 26] as [number, number],
    bubbleSec: 3,
    /** Speech bubbles further than this from the player stay hidden. */
    bubbleRange: 20,
  },

  traffic: {
    speedMin: 5,
    speedMax: 7.5,
    /** Bikes drive off into the fog and come back from the other side. */
    wrapX: 48,
    /** Bikes slow down for a player within slowDistance and stop at stopDistance. */
    slowDistance: 5.5,
    stopDistance: 2.3,
  },

  /** Learning German (plan §6 chapter 1). Level index 0 = A1 course/exam. */
  german: {
    levels: [
      { name: 'A1', courseFee: 300_000, examFee: 100_000, xpToExam: 60 },
      { name: 'A2', courseFee: 400_000, examFee: 150_000, xpToExam: 80 },
      { name: 'B1', courseFee: 500_000, examFee: 200_000, xpToExam: 100 },
    ],
    lessonMinutes: 60,
    lessonEnergy: 8,
    xpPerCorrect: 3,
    perfectBonus: 6,
    selfStudyMinutes: 45,
    selfStudyEnergy: 5,
    selfStudyXpFactor: 0.5,
    examMinutes: 120,
    examPassScore: 0.7,
    examPassMood: 15,
    examFailMood: -8,
  },

  /** The visa chapter (plan §6 chapter 2). Amounts are game-balanced, not real-world prices. */
  visa: {
    /** Simplified in-game exchange rate used when you move to Germany. */
    vndPerEur: 3000,
    financeProof: { studium: 3_000_000, ausbildung: 1_500_000 },
    flightCost: 1_500_000,
    xeOmFare: 30_000,
    xeOmMinutes: 30,
    /** A booked Termin is this many days later. */
    terminLeadDays: 2,
    terminAttempts: 4,
    interviewPassScore: 0.6,
    /** Days between an approved interview and the visa being ready. */
    approvalWaitDays: 2,
    rejectCooldownDays: 1,
    embassyHours: [8, 17] as [number, number],
  },

  /** Living in Germany (plan §6 chapter 3). Prices in EUR. */
  germany: {
    rentPerWeek: 95,
    hostelPerNight: 25,
    ticketPerWeek: 15,
    fareDodgeFine: 60,
    fareCheckChance: 0.35,
    tramMinutes: 20,
    officeHours: [8, 16] as [number, number],
    /** Waiting for your number to be called at the Bürgeramt. */
    waitMinutes: 90,
    wgCastingPassScore: 0.6,
    supermarketHours: [8, 22] as [number, number],
  },

  /** Ausbildung in the care home (plan §6 chapter 4B). */
  care: {
    durationSec: 120,
    /** EUR for a full workday at 100% multiplier 1.0. */
    pay: 60,
    energyCost: 25,
    xp: 25,
    hours: 8,
    startHours: [6, 14] as [number, number],
    /** At most this many residents need help at once. */
    maxNeeds: 2,
    needGapSec: [2.5, 6] as [number, number],
    patienceSec: 16,
    meter: { start: 50, helped: 10, wrong: 6, missed: 12 },
  },

  /** Collecting deposit bottles (plan §6 side hustles). */
  pfand: {
    perBottle: 0.25,
    onStreet: 8,
    respawnSec: [35, 80] as [number, number],
    pickupRadius: 0.9,
  },

  save: {
    /** Wait this long after a change before writing the save. */
    debounceMs: 1500,
    /** Also save the player's position this often. */
    positionIntervalMs: 10_000,
  },

  world: {
    gravity: -20,
  },

  weather: {
    /** Chance that a given day is rainy (decided per day, the same on every device). */
    rainChance: { vn: 0.3, de: 0.45 },
    /** Saigon rain comes as an afternoon shower (hours); German rain lasts all day. */
    vnShowerHours: [14, 16.5] as [number, number],
    /** Particle counts per quality level. */
    particles: { high: { rain: 1800, petals: 110 }, low: { rain: 800, petals: 45 } },
    /** Phượng/bằng lăng petals drift down in Vietnam during these hours when it's dry. */
    petalHours: [6, 18.5] as [number, number],
  },

  graphics: {
    high: { maxDpr: 2, shadowMapSize: 2048 },
    low: { maxDpr: 1.25, shadowMapSize: 1024 },
  },

  joystick: {
    /** How far (px) the knob can travel from the centre. */
    radiusPx: 52,
    /** Fraction of the radius ignored around the centre. */
    deadZone: 0.12,
  },

  ui: {
    /** How long the controls hint stays on screen (ms). */
    hintDurationMs: 8000,
    /** How long a toast message stays on screen (ms). */
    toastMs: 1700,
  },

  /** Rules shared by every WorkStation task. */
  work: {
    /** "Độ hài lòng" (satisfaction) meter, 0–100. */
    meter: { start: 50, served: 12, fastBonus: 6, wrong: 8, timeout: 15 },
    /** An order counts as "fast" (bonus + tip) if at least this share of patience is left. */
    fastThreshold: 0.5,
    /** Pause after an order is resolved before the next customer is scheduled. */
    leaveDelaySec: 0.9,
    /** Wage multiplier at 0% and 100% satisfaction. */
    payMultiplier: { min: 0.5, max: 1.5 },
  },

  /** Balancing per job. Content (actions, recipes) lives in data/tasks.ts. */
  jobs: {
    cafeBarista: {
      durationSec: 60,
      /** Wage (VND) for a full shift at 100% multiplier 1.0. */
      pay: 100_000,
      tipPerFastOrder: 3_000,
      energyCost: 15,
      xp: 20,
      patienceBaseSec: 7,
      patiencePerStepSec: 2.5,
      customerGapSec: 0.8,
      /** Time a customer takes to walk from the door to the counter. */
      arriveSec: 1.0,
      /** In-game hours a full shift takes (prorated if you stop early). */
      hours: 3,
      openHour: 7,
      closeHour: 22,
    },
  },
}

export type QualityLevel = keyof typeof CONFIG.graphics
