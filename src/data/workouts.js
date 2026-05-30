const PHOENIX_PROTOCOL = {
  name: 'Phoenix Protocol',
  subtitle: 'Rise from the Ashes: A Progressive Workout Guide',

  goldenRules: [
    {
      icon: 'form',
      title: 'Form > Numbers',
      description: 'If you are shaking or losing form, stop the set immediately.'
    },
    {
      icon: 'rest',
      title: 'The 2-Day Rule',
      description: 'If you get a fever or extreme fatigue (beyond normal soreness), skip 2 days immediately.'
    },
    {
      icon: 'hydration',
      title: 'Hydration',
      description: 'Drink 1 glass of water before and after the session.'
    }
  ],

  warmup: {
    name: 'Universal Warm-Up',
    duration: 5,
    description: 'Do before EVERY workout',
    exercises: [
      {
        name: 'Neck Rotations',
        description: '10 slow circles each direction',
        type: 'reps',
        reps: '10 each direction',
        illustration: 'neck-rotations'
      },
      {
        name: 'Arm Circles',
        description: '20 big circles forward, 20 backward',
        type: 'reps',
        reps: '20 forward + 20 backward',
        illustration: 'arm-circles'
      },
      {
        name: 'Hip Rotations',
        description: '10 big circles each direction',
        type: 'reps',
        reps: '10 each direction',
        illustration: 'hip-rotations'
      },
      {
        name: 'Jumping Jacks',
        description: 'Full body warm-up with explosive movement',
        type: 'timed',
        duration: 30,
        illustration: 'jumping-jacks'
      },
      {
        name: 'Spot March',
        description: 'March in place, lifting knees high',
        type: 'timed',
        duration: 60,
        illustration: 'spot-march'
      }
    ]
  },

  phases: [
    {
      id: 1,
      name: 'The Foundation',
      subtitle: 'Rehab',
      icon: 'foundation',
      weeks: { start: 1, end: 4, total: 4 },
      schedule: {
        workDays: [1, 2, 4, 5],
        workDaysPerWeek: 4,
        restDaysPerWeek: 3,
        label: 'Mon, Tue, Thu, Fri'
      },
      method: {
        name: 'Straight Sets',
        description: 'Finish all sets of Ex. 1 before Ex. 2',
        why: 'Full recovery, prevents trembling crash.'
      },
      exercises: [
        {
          id: 'p1e1',
          name: 'Incline Pushups',
          sets: 3,
          reps: '8-10',
          rest: 90,
          type: 'reps',
          illustration: 'incline-pushups',
          tips: 'Hands on bed/desk, keep straight. Rest 90s between sets.',
          formCues: ['Keep body in a straight line', 'Lower chest to surface', 'Push back up fully']
        },
        {
          id: 'p1e2',
          name: 'Active Dead Hangs',
          sets: 3,
          duration: '20-30',
          durationMin: 20,
          durationMax: 30,
          rest: 60,
          type: 'timed',
          illustration: 'dead-hangs',
          tips: 'Jump to hold bar, shoulders down, squeeze hard. Rest 60s.',
          formCues: ['Engage shoulders (pull them down)', 'Squeeze the bar hard', 'Keep core tight']
        },
        {
          id: 'p1e3',
          name: 'Bodyweight Squats',
          sets: 3,
          reps: '12',
          rest: 90,
          type: 'reps',
          illustration: 'squats',
          tips: 'Slow tempo: 3s down, 1s up. Rest 90s.',
          tempo: '3-0-1-0',
          formCues: ['3 seconds going down', '1 second coming up', 'Keep chest up, knees tracking toes']
        },
        {
          id: 'p1e4',
          name: 'Glute Bridges',
          sets: 3,
          reps: '15',
          rest: 60,
          type: 'reps',
          illustration: 'glute-bridges',
          tips: 'Lie back, lift hips, squeeze glutes at top. Rest 60s.',
          formCues: ['Press through heels', 'Squeeze glutes at the top', 'Don\'t hyperextend lower back']
        },
        {
          id: 'p1e5',
          name: 'Plank',
          sets: 3,
          duration: '20',
          durationMin: 20,
          durationMax: 20,
          rest: 60,
          type: 'timed',
          illustration: 'plank',
          tips: 'If shaking, stop. Rest 60s.',
          formCues: ['Keep body straight like a board', 'Engage core', 'Stop if shaking (Golden Rule #1)']
        }
      ],
      cooldown: [
        {
          name: "Child's Pose",
          duration: 120,
          illustration: 'childs-pose',
          description: 'Hold for 2 minutes. Deep breathing.'
        }
      ],
      graduationTest: {
        exercise: 'Standard Floor Pushups',
        requirement: '15 reps without shaking',
        reps: 15,
        description: 'Can you do 15 standard floor pushups without shaking? If YES → Phase 2.',
        illustration: 'pushups'
      }
    },
    {
      id: 2,
      name: 'The Builder',
      subtitle: 'Hypertrophy',
      icon: 'builder',
      weeks: { start: 5, end: 8, total: 4 },
      schedule: {
        workDays: [1, 2, 4, 5, 6],
        workDaysPerWeek: 5,
        restDaysPerWeek: 2,
        label: 'Mon, Tue, Thu, Fri, Sat'
      },
      method: {
        name: 'Supersets',
        description: 'Do 1A, then 1B, then Rest',
        why: 'Increases intensity slightly for muscle without full cardio stress.'
      },
      exerciseGroups: [
        {
          type: 'superset',
          label: 'Superset 1',
          rounds: 3,
          rest: 90,
          exercises: [
            {
              id: 'p2e1a',
              name: 'Standard Floor Pushups',
              label: '1A',
              reps: '8-12',
              type: 'reps',
              illustration: 'pushups',
              tips: 'Full range of motion. Chest to floor.',
              formCues: ['Hands shoulder-width apart', 'Lower chest to floor', 'Push up explosively']
            },
            {
              id: 'p2e1b',
              name: 'Negative Pull-Ups',
              label: '1B',
              reps: '5',
              type: 'reps',
              illustration: 'negative-pullups',
              tips: 'Use chair to get up, lower for 5 seconds.',
              formCues: ['Jump or use chair to get chin above bar', 'Lower yourself for 5 seconds', 'Control the descent']
            }
          ]
        },
        {
          type: 'superset',
          label: 'Superset 2',
          rounds: 3,
          rest: 90,
          exercises: [
            {
              id: 'p2e2a',
              name: 'Reverse Lunges',
              label: '2A',
              reps: '10 per leg',
              type: 'reps',
              illustration: 'reverse-lunges',
              tips: 'Step back, drop knee. 10 reps per leg.',
              formCues: ['Step back, not forward', 'Drop back knee toward floor', 'Keep front knee over ankle']
            },
            {
              id: 'p2e2b',
              name: 'Plank to Shoulder Tap',
              label: '2B',
              reps: '20 taps total',
              type: 'reps',
              illustration: 'plank-shoulder-tap',
              tips: '20 taps total. Keep hips stable.',
              formCues: ['Start in high plank', 'Tap opposite shoulder', 'Minimize hip rotation']
            }
          ]
        },
        {
          type: 'finisher',
          label: 'Finisher',
          exercises: [
            {
              id: 'p2e3',
              name: 'Bodyweight Squats',
              reps: 'Max Reps',
              sets: 1,
              type: 'max-reps',
              illustration: 'squats',
              tips: 'Stop 2 reps before failure. 1 set only.',
              formCues: ['Go until 2 reps before failure', 'Maintain good form throughout', 'Record your max reps']
            }
          ]
        }
      ],
      cooldown: [
        {
          name: 'Standing Toe Touch',
          duration: 60,
          illustration: 'toe-touch',
          description: 'Reach for your toes. Hold 1 minute.'
        },
        {
          name: 'Cobra Stretch',
          duration: 60,
          illustration: 'cobra-stretch',
          description: 'Lie on stomach, push upper body up. Hold 1 minute.'
        }
      ],
      graduationTest: {
        exercise: 'Pushups',
        requirement: '30 reps in one set',
        reps: 30,
        description: 'Can you do 30 pushups in one set? If YES → Phase 3.',
        illustration: 'pushups'
      }
    },
    {
      id: 3,
      name: 'The Shred',
      subtitle: 'Intensity',
      icon: 'shred',
      weeks: { start: 9, end: 12, total: 4 },
      schedule: {
        workDays: [1, 2, 3, 4, 5, 6],
        workDaysPerWeek: 6,
        restDaysPerWeek: 1,
        label: '6 Days (Mon-Sat)'
      },
      method: {
        name: 'Circuit Training',
        description: 'Do 5 exercises back-to-back, no rest between exercises',
        why: 'High heart rate burns fat, maintains muscle.'
      },
      circuit: {
        rounds: { min: 3, max: 4 },
        restBetweenRounds: 120,
        exercises: [
          {
            id: 'p3e1',
            name: 'Chin-Ups',
            reps: 'Max reps (or as many negatives)',
            type: 'max-reps',
            illustration: 'chin-ups',
            tips: 'Max reps or as many negatives as you can.',
            formCues: ['Palms facing you', 'Pull chin above bar', 'If needed, do negatives']
          },
          {
            id: 'p3e2',
            name: 'Pushups',
            reps: '15-20',
            type: 'reps',
            illustration: 'pushups',
            tips: 'Full range of motion.',
            formCues: ['Chest to floor', 'Full extension at top', 'Maintain plank position']
          },
          {
            id: 'p3e3',
            name: 'Squat Jumps',
            reps: '15',
            type: 'reps',
            illustration: 'squat-jumps',
            tips: 'Explosive power. Land softly.',
            formCues: ['Squat down', 'Explode upward', 'Land softly on balls of feet']
          },
          {
            id: 'p3e4',
            name: 'Mountain Climbers',
            duration: '30',
            durationMin: 30,
            durationMax: 30,
            type: 'timed',
            illustration: 'mountain-climbers',
            tips: '30 seconds. Drive knees to chest quickly.',
            formCues: ['Start in plank position', 'Drive knees to chest alternately', 'Keep hips level']
          },
          {
            id: 'p3e5',
            name: 'Leg Raises',
            reps: '15',
            type: 'reps',
            illustration: 'leg-raises',
            tips: 'Lying on floor. Control the movement.',
            formCues: ['Keep lower back pressed to floor', 'Raise legs to 90 degrees', 'Lower slowly with control']
          }
        ]
      },
      cooldown: [
        {
          name: 'Full Body Stretch',
          duration: 300,
          illustration: 'full-body-stretch',
          description: 'Full body stretch. Hold each position for 30 seconds. 5 minutes total.'
        }
      ],
      graduationTest: null,
      completionMessage: 'PROGRAM COMPLETE — YOU HAVE RISEN!'
    }
  ]
};

export { PHOENIX_PROTOCOL };
export default PHOENIX_PROTOCOL;
