import randomize from "randomatic";

export const isAdmin = (user) => {
  const roles = user.roles;
  const isAdmin = roles.includes("ADMIN");
  return isAdmin;
};

export const generateRandomId = (size) => {
  const id = randomize("*", size);
  return id;
};

export const getPlanSpace = (user) => {
  const plan = user.plan;
  if (plan === "BASIC") {
    return 5000 * 1024 * 1024;
  }
  if (plan === "PRO") {
    return 500000 * 1024 * 1024;
  }
  if (plan === "ENTERPRISE") {
    return 1000000 * 1024 * 1024;
  }
};
