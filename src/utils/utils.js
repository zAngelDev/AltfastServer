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
