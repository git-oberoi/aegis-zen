import User from '../models/User.js';

export const findById = async (id) => {
  return await User.findById(id);
};

export const findByEmail = async (email) => {
  return await User.findOne({ email });
};

export const create = async (data) => {
  return await User.create(data);
};

/**
 * Find or auto-generate the default Sandbox user to maintain demo-mode execution.
 */
export const findOrCreateDemoUser = async () => {
  const demoEmail = 'demo@aegiszen.com';
  let user = await findByEmail(demoEmail);
  if (!user) {
    user = await create({
      name: 'Focus Planner',
      email: demoEmail,
      password: 'demo_password_placeholder_v2',
      timezone: 'UTC',
      theme: 'dark',
      onboardingCompleted: true
    });
    console.log(`👤 Created default Sandbox user in MongoDB: ${user._id}`);
  }
  return user;
};
