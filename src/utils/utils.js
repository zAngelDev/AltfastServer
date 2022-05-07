export const isAdmin = (user) => {
  const roles = user.roles;
  const isAdmin = roles.includes("ADMIN");
  return isAdmin;
};
