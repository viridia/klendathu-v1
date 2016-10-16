module.exports = {
  // Serialize profile
  profile: u => ({
    id: u._id,
    fullname: u.fullname,
    username: u.username,
    photo: u.photo,
    verified: u.verified,
  }),
};
