export const PASSWORD_REGEX = {
  // Uppercase, lowercase, numbers, special characters and length greater than 6
  HIGH: {
    regex: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/,
    message: 'REGEX.PASSWORD_REQUIRE',
  },
};