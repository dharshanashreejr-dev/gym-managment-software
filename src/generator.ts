export type Goal = 'Fat loss' | 'Muscle gain' | 'General fitness'
export type Level = 'Beginner' | 'Intermediate' | 'Advanced'
export type Food = 'Vegetarian' | 'Egg and vegetarian' | 'Non-vegetarian'
export interface GenInput { goal: Goal; level: Level; days: number; food: Food; weight: number; age: number }
export interface GenOut { workout: string[]; diet: string[]; calories: number; protein: number }
const split: Record<number, string[]> = {
  3: ['Full body strength', 'Cardio', 'Full body strength'],
  4: ['Upper body', 'Lower body', 'Cardio', 'Full body strength'],
  5: ['Chest and triceps', 'Back and biceps', 'Legs', 'Shoulders and abs', 'Cardio'],
  6: ['Push (chest, shoulders, triceps)', 'Pull (back, biceps)', 'Legs', 'Upper body', 'Lower body', 'Cardio'],
}
const slots: Record<number, number[]> = { 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 4, 5], 6: [0, 1, 2, 3, 4, 5] }
const names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const sets = (g: Goal, l: Level) => g === 'Fat loss'
  ? { Beginner: '3 sets of 15', Intermediate: '4 sets of 12', Advanced: '4 sets of 12 with short rests' }[l]
  : { Beginner: '3 sets of 12', Intermediate: '4 sets of 10', Advanced: '5 sets of 6 to 8' }[l]
export function generatePlan(i: GenInput): GenOut {
  const mins = i.goal === 'Muscle gain' ? 20 : { Beginner: 20, Intermediate: 30, Advanced: 40 }[i.level]
  const on = slots[i.days], plan = split[i.days]
  const workout = names.map((d, idx) => {
    const k = on.indexOf(idx)
    if (k < 0) return d + (idx === 6 ? ': Rest day' : ': Active rest, 30 minute walk or stretching')
    const s = plan[k]
    if (s === 'Cardio') return `${d}: Cardio ${mins} minutes, then a core circuit`
    return `${d}: ${s}, ${sets(i.goal, i.level)}${i.goal === 'Fat loss' ? ', then 15 minute cardio' : ''}`
  })
  if (i.age >= 45) workout.push('Before every session: 10 minute warm-up and mobility work')
  const carb = { 'Fat loss': '1 cup brown rice or 2 chapatis', 'Muscle gain': '2 cups rice or 4 chapatis', 'General fitness': '1.5 cups rice or 3 chapatis' }[i.goal]
  const f = i.food
  const bf = { 'Fat loss': 'Oats or 2 idlis with sambar', 'Muscle gain': 'Oats with milk, banana and nuts', 'General fitness': 'Idli or dosa with sambar' }[i.goal]
  const add = { Vegetarian: 'and a bowl of sprouts', 'Egg and vegetarian': 'and 2 boiled eggs', 'Non-vegetarian': 'and 2 boiled eggs' }[f]
  const lunch = { Vegetarian: 'dal', 'Egg and vegetarian': 'dal and egg curry', 'Non-vegetarian': 'grilled chicken or fish curry' }[f]
  const snack = { Vegetarian: 'Roasted chana and a glass of milk', 'Egg and vegetarian': 'Boiled egg and roasted chana', 'Non-vegetarian': 'Boiled eggs or a chicken sandwich' }[f]
  const dinner = { Vegetarian: 'paneer or soya curry', 'Egg and vegetarian': 'paneer curry or omelette', 'Non-vegetarian': 'grilled chicken or fish' }[f]
  const diet = [
    `Breakfast: ${bf} ${add}`,
    `Mid-morning: ${i.goal === 'Muscle gain' ? 'Banana with peanut butter' : 'Buttermilk or green tea with a fruit'}`,
    `Lunch: ${carb}, ${lunch}, vegetables and curd`,
    `Evening: ${snack}`,
    `Dinner: ${i.goal === 'Fat loss' ? '2 chapatis' : '3 chapatis'}, ${dinner}, salad`,
    ...(i.goal === 'Muscle gain' ? ['Before bed: A glass of milk with almonds'] : []),
    'Water: 3 litres through the day',
  ]
  const calories = Math.round((i.weight * 31 + { 'Fat loss': -450, 'Muscle gain': 350, 'General fitness': 0 }[i.goal]) / 50) * 50
  const protein = Math.round(i.weight * { 'Fat loss': 1.6, 'Muscle gain': 1.8, 'General fitness': 1.4 }[i.goal])
  return { workout, diet, calories, protein }
}
