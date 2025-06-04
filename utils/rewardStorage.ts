// // utils/rewardStorage.ts
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const REWARD_KEY = 'user_reward_points';

// export const getRewardPoints = async (): Promise<number> => {
//   const points = await AsyncStorage.getItem(REWARD_KEY);
//   return points ? parseInt(points, 10) : 0;
// };

// export const addRewardPoints = async (newPoints: number) => {
//   const currentPoints = await getRewardPoints();
//   const updatedPoints = currentPoints + newPoints;
//   await AsyncStorage.setItem(REWARD_KEY, updatedPoints.toString());
//   return updatedPoints;
// };

// export const resetRewardPoints = async () => {
//   await AsyncStorage.setItem(REWARD_KEY, '0');
// };


import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'user_rewards';

export const getAllRewards = async () => {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
};

export const getRewardForUser = async (username) => {
  const allRewards = await getAllRewards();
  return allRewards[username] || 0;
};

export const addRewardForUser = async (username, reward) => {
  const allRewards = await getAllRewards();
  const current = allRewards[username] || 0;
  allRewards[username] = current + reward;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allRewards));
  return allRewards[username];
};
